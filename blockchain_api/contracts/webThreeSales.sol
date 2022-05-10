// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

struct Order {
        string api_id;
        address worker_address;
        address ordered_by;

        uint256 price;
        uint256 delivery_day;
        string order_title;
        string order_desc;
        string plan_title;
        string plan_desc;

        string user_info;
        string status;
        string ipfs_hash;
        string decline_reason;

        bool customer_accepted;
        bool accepted;
        uint256 accepted_at;
        uint256 ordered_at;
}

library Orders {
    function getOrdersLen(mapping(address => Order[]) storage orders, address worker, address[] memory addresses) internal view returns(uint256) {
        uint256 len  = 0;
        for(uint i = 0; i < addresses.length; i++) {
            for(uint y = 0; y < orders[addresses[i]].length; y++) {
                if(orders[addresses[i]][y].worker_address == worker) {
                    len++;
                }
            }
        }

        return len;
    }
}

contract webThreeSales {
    event Deposited(address indexed payee, uint256 weiAmount);
    event Withdrawn(address indexed payee, uint256 weiAmount);
    event Refunded(address indexed payee, uint256 weiAmmount, string jobId);


    address private contract_owner;

    mapping(address => bool) admins;
    mapping(address => Order[]) orders;

    mapping(string => address) job_owners;
    mapping(string => mapping(string => uint256)) plans_price;

    mapping(address => uint256) balances;

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
        string memory plan_desc,
        string memory user_info
        ) jobOrdered(api_id) payable external {
        
        require(job_owners[api_id] != address(0), "job.not.exist");
        require(plans_price[api_id][plan_title] != 0, "plan.not.exist");
        require(msg.value == plans_price[api_id][plan_title], "invalid.price");

        Order memory order = Order(
            api_id, 
            job_owners[api_id],
            msg.sender,
            plans_price[api_id][plan_title],
            delivery_day,
            order_title,
            order_desc,
            plan_title,
            plan_desc,
            user_info,
            "WFA",
            "",
            "",
            false,
            false,
            0,
            block.timestamp
            );
        
        orders[msg.sender].push(order);

        if (!isInArray(msg.sender, addresses)) {
            addresses.push(msg.sender);
        }


        emit Deposited(msg.sender, order.price);
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

        uint256 len = Orders.getOrdersLen(orders, msg.sender, addresses);
        // New array with worker orders
        Order[] memory worker_orders = new Order[](len);

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

    /**
        @dev Check if an user already ordered a job
     */
    modifier jobOrdered(string memory job_id) {
        bool exist = false;

        for(uint256 i; i < orders[msg.sender].length; i++) {
            if(isStringEquals(orders[msg.sender][i].api_id, job_id)) {
                if(!isStringEquals(orders[msg.sender][i].status, "done") && !isStringEquals(orders[msg.sender][i].status, "declined"))
                {
                    exist = true;
                    break;
                }
            }
        }
        
        require(exist == false, "job.already.ordered");
        _;
    }

    modifier jobExist(string memory job_id, address customer) {
        bool exist = false;

        for(uint256 i; i < orders[customer].length; i++) {

            if(isStringEquals(orders[customer][i].api_id, job_id)) {
                exist = true;
                break;
            }
        }

        require(exist == true, "order.not.exist");
        _;
    }

    function createJob(
        string memory job_id,
        uint256 basic_price,
        uint256 premium_price,
        uint256 standard_price
        ) public {

        require(job_owners[job_id] == address(0), "job.already.registered");
        require(basic_price > 0 || premium_price > 0 || standard_price > 0, "no.plans.defined");

        job_owners[job_id] = msg.sender;

       
        plans_price[job_id]["Basic"] = basic_price;
        plans_price[job_id]["Premium"] = premium_price;
        plans_price[job_id]["Standard"] = standard_price;
    }

    function finishJob(string memory job_id, address customer, uint256 ordered_at, string memory ipfs_hash) public {
        uint256 orderIndex = getOrderIndex(job_id, customer, ordered_at);
        require(orders[customer][orderIndex].worker_address == msg.sender, "not.owner");
        orders[customer][orderIndex].ipfs_hash = ipfs_hash;
        orders[customer][orderIndex].status = "done";
    }

    function approveOrDeclineWork(
            string memory job_id, 
            uint256 ordered_at, 
            string memory action, 
            bool fromCustomer,
            string memory decline_reason,
            address payable customer
            
            ) jobExist(job_id, customer) public {

        uint256 orderIndex = getOrderIndex(job_id, msg.sender, ordered_at);

        
        
        bool accept = isStringEquals(action, "accept");
        bool decline = isStringEquals(action, "decline");

        require(accept || decline, "bad.action");

        if(fromCustomer) {
            
            require(orders[msg.sender][orderIndex].ordered_by == msg.sender, "not.customer");
            require(isStringEquals(orders[msg.sender][orderIndex].status, "done"), "order.not.done");
            require(orders[msg.sender][orderIndex].customer_accepted == false , "order.approved");

            if(accept){
                orders[msg.sender][orderIndex].customer_accepted = true;
                uint256 payment = orders[msg.sender][orderIndex].price;
                address  worker = orders[msg.sender][orderIndex].worker_address;
                payable(worker).transfer(payment);

                emit Withdrawn(worker, payment);
            } else {
                orders[msg.sender][orderIndex].decline_reason = decline_reason;
                orders[msg.sender][orderIndex].status = "customer.declined";
            }
        } else {
            require(!isStringEquals(orders[customer][orderIndex].status, "declined") && !isStringEquals(orders[customer][orderIndex].status, "in.progress"), "already.declined.or.accepted");
            require(orders[customer][orderIndex].worker_address == msg.sender, "not.owner");

            if(accept){
                orders[customer][orderIndex].status = "in.progress";
                orders[customer][orderIndex].accepted = true;
            } else {
                customer.transfer(orders[customer][orderIndex].price);
                orders[customer][orderIndex].decline_reason = decline_reason;
                orders[customer][orderIndex].status = "declined";
            }
        }
    }

    function addAdmin(address user) public {
        require(msg.sender == contract_owner, "NCO");
        require(admins[user] == false, "already.admin");
        admins[user] = true;
    }

    function removeAdmin(address user) public {
        require(user != contract_owner, "address.is.owner");
        require(msg.sender == contract_owner, "NCO");
        require(admins[user] == true, "not.admin");
        admins[user] = false;
    }

    function getOrderIndex(string memory job_id, address customer, uint256 ordered_at) private view returns(uint256) {
        for(uint256 i; i < orders[customer].length; i++) {
            if(isStringEquals(orders[customer][i].api_id, job_id) && orders[customer][i].ordered_at == ordered_at) {
                return i;
            }
        }
    }

    function isAdmin() public view returns(bool) {
        return admins[msg.sender];
    }

    function isStringEquals(string memory first, string memory second) private pure returns(bool) {
        return keccak256(abi.encodePacked(first)) == keccak256(abi.encodePacked(second));
    }

    function refundPart(string memory job_id, address payable customer, uint256 ordered_at, bool refundCustomer) jobExist(job_id, customer) public {
        uint256 orderIndex = getOrderIndex(job_id, customer, ordered_at);

        require(isAdmin(), "not.authorized");
        require(orders[customer][orderIndex].customer_accepted == false, "customer.accepted");
        require(isStringEquals(orders[msg.sender][orderIndex].status, "customer_declined"), "customer.not.declined.order");

        uint256 payment = orders[customer][orderIndex].price;

        if(refundCustomer) {
            customer.transfer(payment);
            emit Refunded(customer, payment, orders[customer][orderIndex].api_id);
        } else {
            address worker = orders[customer][orderIndex].worker_address;
            payable(worker).transfer(payment);
            emit Withdrawn(worker, payment);
        }

        orders[customer][orderIndex].status = "done";
        orders[customer][orderIndex].customer_accepted = true;
    }
   
}