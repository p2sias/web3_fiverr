// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

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

        uint256 accepted_at;
        uint256 ordered_at;
}

library Orders {

    function isStringEquals(string memory first, string memory second) internal pure returns(bool) {
        return keccak256(abi.encodePacked(first)) == keccak256(abi.encodePacked(second));
    }

    function getOrders(mapping(address => Order[]) storage orders,  address[] memory addresses, string memory mode) internal view returns(Order[] memory) {
        bool all = isStringEquals(mode, "all");

        uint256 len  = 0;
        for(uint i = 0; i < addresses.length; i++) {
            if(all) {
                len += orders[addresses[i]].length;
            } else {
                for(uint y = 0; y < orders[addresses[i]].length; y++) {
                    if(orders[addresses[i]][y].worker_address == msg.sender) {
                        len++;
                    }
                }
            }
        }
        
        // New array with worker orders
        Order[] memory worker_orders = new Order[](len);

        uint wo_cpt = 0;

        // add orders to the array
        for(uint i = 0; i < addresses.length; i++) {
            Order[] memory client_orders = orders[addresses[i]];
            for(uint j = 0; j < client_orders.length; j++) {
                if(!all) {
                    if(client_orders[j].worker_address == msg.sender) {
                        worker_orders[wo_cpt] = client_orders[j];
                        wo_cpt = wo_cpt + 1;
                    } 
                } else {
                    worker_orders[wo_cpt] = client_orders[j];
                    wo_cpt = wo_cpt + 1;
                }
            }
        }

        return worker_orders;
    }


    function isInArray(address target, address[] memory array) internal pure returns(bool)
    {
        for(uint i; i < array.length; i++) {
            if(array[i] == target) {
                return true;
            }
        }
        return false;
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

    constructor() {
        contract_owner = msg.sender;
        admins[msg.sender] = true;
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
        ) notOrdered(api_id) payable external {
        
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
            "wait.for.seller.accept",
            "",
            "",
            0,
            block.timestamp
            );
        
        orders[msg.sender].push(order);

        if (!Orders.isInArray(msg.sender, addresses)) {
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

    /**
        @dev get orders as a worker
     */
    function getOrders() public view returns (Order[] memory) {
        return Orders.getOrders(orders, addresses, "worker");
    }

    /**
        @dev Check if an user already ordered a job
     */
    modifier notOrdered(string memory api_id) {

        for(uint i = 0; i < orders[msg.sender].length; i++) {
            Order memory order = orders[msg.sender][i];

            if(Orders.isStringEquals(api_id, order.api_id)) {
                require(!Orders.isStringEquals(order.status, "wait.for.seller.accept")  &&
                        !Orders.isStringEquals(order.status, "in.progress") &&
                        !Orders.isStringEquals(order.status, "wait.for.customer.accept"), "already.ordered");
            } 
        }

        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "not.authorized");
        _;
    }

    modifier jobExist(string memory job_id, address customer, uint256 ordered_at) {
        bool exist = false;

        for(uint256 i; i < orders[customer].length; i++) {

            if(Orders.isStringEquals(orders[customer][i].api_id, job_id) && orders[customer][i].ordered_at == ordered_at) {
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

    function finishJob(string memory job_id, address customer, uint256 ordered_at, string memory ipfs_hash) jobExist(job_id, customer, ordered_at) public {
        uint256 orderIndex = getOrderIndex(job_id, customer, ordered_at);
        
        require(orders[customer][orderIndex].worker_address == msg.sender, "not.owner");
        require(Orders.isStringEquals(orders[customer][orderIndex].status, "in.progress"), "order.not.in.progress");

        orders[customer][orderIndex].ipfs_hash = ipfs_hash;
        orders[customer][orderIndex].status = "wait.for.customer.accept";
    }

    function approveOrDeclineWork(string memory job_id, uint256 ordered_at, string memory action, 
                                  bool fromCustomer, string memory decline_reason, address payable customer) jobExist(job_id, customer, ordered_at) public{

        uint256 orderIndex = 0;

        bool accept = Orders.isStringEquals(action, "accept");
        bool decline = Orders.isStringEquals(action, "decline");

        require(accept || decline, "bad.action");

        bool finded = false;

        for(uint i = 0; i < orders[customer].length; i++) {
            if(fromCustomer && Orders.isStringEquals(orders[customer][i].status, "wait.for.customer.accept")) {
                orderIndex = i;
                finded = true;
                break;
            }
            if(!fromCustomer && Orders.isStringEquals(orders[customer][i].status, "wait.for.seller.accept")) {
                orderIndex = i;
                finded = true;
                break;
            }
        }

        require(finded, "order.not.awaiting.res");
        uint256 payment = orders[customer][orderIndex].price;
    
        if(fromCustomer)
        {
            require(orders[msg.sender][orderIndex].ordered_by == msg.sender, "not.customer");

            if(accept) {
                orders[msg.sender][orderIndex].status = "done";
                payable(orders[msg.sender][orderIndex].worker_address).transfer(payment);
            } else  {
                orders[msg.sender][orderIndex].decline_reason = decline_reason;
                orders[msg.sender][orderIndex].status = "customer.declined";
            }
            
        } else {
            require(orders[customer][orderIndex].worker_address == msg.sender, "not.seller");

            if(accept) {
                orders[customer][orderIndex].status = "in.progress";
            } else {
                orders[customer][orderIndex].decline_reason = decline_reason;
                orders[customer][orderIndex].status = "seller.declined";
                customer.transfer(payment);
            }
        }
    }

    function addAdmin(address user) public {
        require(msg.sender == contract_owner, "not.contract.owner");
        require(admins[user] == false, "already.admin");
        admins[user] = true;
    }

    function removeAdmin(address user) public {
        require(user != contract_owner, "address.is.owner");
        require(msg.sender == contract_owner, "not.contract.owner"); 
        admins[user] = false;
    }

    function getOrderIndex(string memory job_id, address customer, uint256 ordered_at) private view returns(uint256) {
        for(uint256 i; i < orders[customer].length; i++) {
            if(Orders.isStringEquals(orders[customer][i].api_id, job_id) && orders[customer][i].ordered_at == ordered_at) {
                return i;
            }
        }
    }

    function isAdmin() public view returns(bool) {
        return admins[msg.sender];
    }

    function getAllOrders() onlyAdmin public view returns(Order[] memory){
        return Orders.getOrders(orders, addresses, "all");
    }

    

    function refundPart(string memory job_id, address payable customer, uint256 ordered_at, bool refundCustomer) onlyAdmin jobExist(job_id, customer, ordered_at) public {
        uint256 orderIndex = getOrderIndex(job_id, customer, ordered_at);

        require(Orders.isStringEquals(orders[customer][orderIndex].status, "customer.declined"), "refund.not.possible");

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
    }
   
}