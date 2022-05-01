// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;


contract webThreeSales {
    event Deposited(address indexed payee, uint256 weiAmount);
    event Withdrawn(address indexed payee, uint256 weiAmount);



    struct Order {
        string api_id;
        address worker_address;

        uint256 price;
        uint256 delivery_day;
        string order_title;
        string order_desc;
        string plan_title;
        string plan_desc;

        string status;
        bool customer_accepted;
        bool accepted;
        bool payed;
        uint256 accepted_at;
        uint256 ordered_at;
    }


    address private contract_owner;

    mapping(address => bool) admins;
    mapping(address => Order[]) orders;

    mapping(string => address) job_owners;
    mapping(string => uint256) job_price;
    mapping(string => mapping(string => uint256)) plans_price;

    address[] private addresses; 
    address[] private workers;

    constructor() payable {
        contract_owner = msg.sender;
        admins[msg.sender] = true;
    }

    function isInArray(address target, address[] memory array) private pure returns(bool)
    {
        for(uint i; i < array.length; i++) {
            if(array[i] == target) {
                return true;
            }
        }
        return false;
    }

    /**
        @dev Post a new order on a existing job
    */
    function postOrder(
        string memory api_id,
        uint256 delivery_day,
        string memory order_title,
        string memory order_desc,
        string memory plan_title,
        string memory plan_desc
        ) jobOrdered(api_id) public returns (Order memory) {
        require(job_owners[api_id] != address(0), "job.not.exist");
        require(plans_price[api_id][plan_title] != 0, "plan.not.exist");

        Order memory order = Order(
            api_id, 
            job_owners[api_id],
            plans_price[api_id][plan_title],
            delivery_day,
            order_title,
            order_desc,
            plan_title,
            plan_desc,
            "wait.for.accept", 
            false,
            false, 
            false,
            0,
            block.timestamp
            );
        
        orders[msg.sender].push(order);

        if (!isInArray(msg.sender, addresses)) {
            addresses.push(msg.sender);
        }
        return order;
    }

    /**
        @dev Get ordered jobs
     */
    function getOrdered() public view returns(Order[] memory) {
        return orders[msg.sender];
    }

    function getAddresses() public view returns (address[] memory) {
        return addresses;
    }

    /**
        @dev get orders as a worker
     */
    function getOrders() public view returns (Order[] memory) {
        uint256 orders_len = 0;
        // Get the orders len
        for(uint i = 0; i < addresses.length; i++) {
            Order[] memory client_orders = orders[addresses[i]];
            for(uint j = 0; j < client_orders.length; j++) {
                if(client_orders[j].worker_address == msg.sender) {
                    orders_len = orders_len + 1;
                }
            }
        }

        // New array with worker orders
        Order[] memory worker_orders = new Order[](orders_len);

        uint wo_cpt = 0;

        // add orders to the array
        for(uint i = 0; i < addresses.length; i++) {
            Order[] memory client_orders = orders[addresses[i]];
            for(uint j = 0; j < client_orders.length; j++) {
                if(client_orders[j].worker_address == msg.sender) {
                   worker_orders[wo_cpt] = client_orders[j];
                   wo_cpt = wo_cpt + 1;
                }
            }
        }

        return worker_orders;
    }

    function payOrder(string memory api_id) jobExist(api_id, msg.sender) public payable virtual {
        uint256 amount = msg.value;

        // Get the order index
        uint256 orderIndex = getOrderIndex(api_id, msg.sender);  
        
        address payee = orders[msg.sender][orderIndex].worker_address;

        require(orders[msg.sender][orderIndex].price == amount, "invalid.price");

        orders[msg.sender][orderIndex].payed = true;

        emit Deposited(payee, amount);
    }


    /**
        @dev Check if an user already ordered a job
     */
    modifier jobOrdered(string memory job_id) {
        bool exist = false;

        uint256 orderIndex = getOrderIndex(job_id, msg.sender);

        for(uint256 i; i < orders[msg.sender].length; i++) {
            string memory api_id = orders[msg.sender][orderIndex].api_id;
            if(keccak256(abi.encodePacked(api_id)) == keccak256(abi.encodePacked(job_id))) {
                exist = true;
                break;
            }
        }
        
        require(exist == false, "job.already.ordered");
        _;
    }

    
    modifier jobExist(string memory job_id, address customer) {
        bool exist = false;

        uint256 orderIndex = getOrderIndex(job_id, msg.sender);

        for(uint256 i; i < orders[customer].length; i++) {
            string memory api_id = orders[customer][orderIndex].api_id;
            if(keccak256(abi.encodePacked(api_id)) == keccak256(abi.encodePacked(job_id))) {
                exist = true;
                break;
            }
        }

        require(exist == true, "order.not.exist");
        _;
    }

    function withdraw(string memory job_id, address customer, address payable owner) public virtual {

        uint256 orderIndex = getOrderIndex(job_id, customer);
        string memory status = orders[customer][orderIndex].status;
        string memory doneStatus = "done";

        if(admins[msg.sender] == false) {
            require(orders[customer][orderIndex].customer_accepted == true, "custommer.not.approuved");
            require(keccak256(abi.encodePacked(status)) == keccak256(abi.encodePacked(doneStatus)), "order.not.done");
            require(orders[customer][orderIndex].worker_address == msg.sender, "not.owner");
        }
        
        require(orders[customer][orderIndex].payed == true, "order.not.payed");

        uint256 payment = orders[customer][orderIndex].price;

        payable(owner).transfer(payment);

        emit Withdrawn(msg.sender, payment);
    }

    function createJob(
        string memory job_id,
        bool basic,
        bool premium,
        bool standard,
        uint256 basic_price,
        uint256 premium_price,
        uint256 standard_price
        ) public {

        require(job_owners[job_id] == address(0), "job.already.registered");
        require(basic || premium || standard, "no.plans.defined");

        job_owners[job_id] = msg.sender;

        if(basic) {
            plans_price[job_id]["Basic"] = basic_price;
        }

        if(premium) {
            plans_price[job_id]["Premium"] = premium_price;
        }

        if(standard) {
            plans_price[job_id]["Standard"] = standard_price;
        }
        

        
    }

    function finishJob(string memory job_id, address customer) public {
        uint256 orderIndex = getOrderIndex(job_id, customer);
        require(orders[customer][orderIndex].worker_address == msg.sender, "not.owner");

        orders[customer][orderIndex].status = "done";
    }

    function approveWork(string memory job_id) jobExist(job_id, msg.sender) public {
        uint256 orderIndex = getOrderIndex(job_id, msg.sender);
        string memory status = orders[msg.sender][orderIndex].status;
    
        require(keccak256(abi.encodePacked(status)) == keccak256(abi.encodePacked("done")), "order.not.done");
        orders[msg.sender][orderIndex].customer_accepted = true;
    }

    function acceptWork(string memory job_id, address customer) jobExist(job_id, customer) public {
        uint256 orderIndex = getOrderIndex(job_id, customer);

        require(orders[customer][orderIndex].worker_address == msg.sender, "not.owner");
        require(orders[customer][orderIndex].payed == true, "order.not.payed");

        orders[customer][orderIndex].status = "in.progress";
    
    }

    function addAdmin(address user) public {
        require(msg.sender == contract_owner, "not.contract.owner");
        admins[user] = true;
    }

    function getOrderIndex(string memory job_id, address customer) private view returns(uint256) {
        for(uint256 i; i < orders[customer].length; i++) {
            string memory api_id = orders[customer][i].api_id;
            if(keccak256(abi.encodePacked(api_id)) == keccak256(abi.encodePacked(job_id))) {
                return i;
            }
        }
    }
}