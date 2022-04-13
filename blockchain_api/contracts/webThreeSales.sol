// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract webThreeSales {

    struct Order {
        string api_id;
        uint256 delivery_day;
        address worker_address;
        string title;
        string plan_title;
        uint256 price;
        string plan_desc;
        string status;
        string desc;
        bool accepted;
        uint256 accepted_at;
        uint256 ordered_at;
    }

    mapping(address=>Order[]) orders;

    address private admin;
    address[] private addresses; 
    address[] private workers;

    constructor() {
        admin = msg.sender;
    }

    function isInArray(address element, address[] memory array) private pure returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (element == array[i]) return true;
        }
        return false;
    }

    function postOrder(
        string memory api_id,
        uint256 delivery_day,
        address worker_address,
        string memory order_title,
        string memory order_desc,

        // Plan params
        string memory plan_title,
        string memory plan_desc,
        uint256 plan_price
    ) public returns (Order memory) {

        Order memory order = Order(
            api_id, 
            delivery_day, 
            worker_address, 
            order_title, 
            plan_title, 
            plan_price, 
            plan_desc, 
            "wait.for.accept", 
            order_desc, 
            false, 
            0,
            block.timestamp);
        
        orders[msg.sender].push(order);

        if (!isInArray(msg.sender, addresses)) {
            addresses.push(msg.sender);
        }

        return order;
    }


    Order[] findedOrders;
    

    function getOrdered() public view returns(Order[] memory) {
        return orders[msg.sender];
    }

    function getAddresses() public view returns (address[] memory) {
        return addresses;
    }

    function gerOrders() public view returns (Order[] memory) {
        uint256 orders_len = 0;
        
        for(uint i = 0; i < addresses.length; i++) {
            Order[] memory client_orders = orders[addresses[i]];
            for(uint j = 0; j < client_orders.length; j++) {
                if(client_orders[j].worker_address == msg.sender) {
                    orders_len = orders_len + 1;
                }
            }
        }

        Order[] memory worker_orders = new Order[](orders_len);

        uint wo_cpt = 0;

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
}