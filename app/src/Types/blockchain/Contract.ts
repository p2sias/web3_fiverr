import { ethers } from "ethers";
import abi from "./abi/webThreeSales.json";
import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import Wallet from "./Wallet"
import store from "../../store"
import Order from "./Order";

export default class Contract {
    provider: Web3Provider;
    contractAddress: string;
    contractABI: any;
    signer: JsonRpcSigner;

    

    constructor(_address: string, _wallet: Wallet) {
        this.provider = new ethers.providers.Web3Provider(_wallet.getEthClient());
        this.contractAddress = _address;
        this.contractABI = abi.abi;
        this.signer = this.provider.getSigner();
    }

    get webFiverContract(): ethers.Contract {
        return new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
    }

    formatHex(_hex: string)
    {
        return parseInt(_hex, 16);
    }

    async getBalance(): Promise<any> {
        if(this.webFiverContract) {
            await this.provider.getBalance(this.webFiverContract.address)
            .then((res: any) => console.log(res))
        } 
    }

    async getOrders(): Promise<any> {
        if (this.webFiverContract) {
            const res: any = await this.webFiverContract.getOrders();

            const orders: Order[] = []

            res.forEach((order: any) => {
                orders.push({
                    api_id: order.api_id,
                    delivery_day: this.formatHex(order.delivery_day._hex),
                    worker_address: order.worker_address,
                    title: order.order_title,
                    plan_title: order.plan_title,
                    price: this.formatHex(order.price._hex),
                    plan_desc: order.plan_desc,
                    status: order.status,
                    ipfs_hash: order.ipfs_hash,
                    desc: order.order_desc,
                    accepted: order.accepted,
                    user_infos: order.user_info,
                    decline_reason: order.decline_reason,
                    customer_accepted: order.customer_accepted,
                    ordered_by: order.ordered_by,
                    accepted_at: this.formatHex(order.accepted_at._hex),
                    ordered_at: this.formatHex(order.ordered_at._hex)
                })
            });
            
            return orders;
        } return [];
    }

    async getOrdered(): Promise<Order[]> {
        if (this.webFiverContract) {
            const res: any = await this.webFiverContract.getOrdered();

            const ordered: Order[] = []

            res.forEach((order: any) => {
                ordered.push({
                    api_id: order.api_id,
                    delivery_day: this.formatHex(order.delivery_day._hex),
                    worker_address: order.worker_address,
                    title: order.order_title,
                    plan_title: order.plan_title,
                    price: this.formatHex(order.price._hex),
                    plan_desc: order.plan_desc,
                    status: order.status,
                    ipfs_hash: order.ipfs_hash,
                    decline_reason: order.decline_reason,
                    desc: order.order_desc,
                    accepted: order.accepted,
                    user_infos: order.user_info,
                    customer_accepted: order.customer_accepted,
                    ordered_by: order.ordered_by,
                    accepted_at: this.formatHex(order.accepted_at._hex),
                    ordered_at: this.formatHex(order.ordered_at._hex)
                })
            });
            
            return ordered;
        } return [];
    }

    async createJob(
        _apiId: string,
        _basicPrice: number,
        _premiumPrice: number,
        _standardPrice: number
    ): Promise<boolean> {

        try {
            if (this.webFiverContract) {
                await this.webFiverContract.createJob(
                    _apiId,
                    ethers.utils.parseEther(_basicPrice.toString()),
                    ethers.utils.parseEther(_premiumPrice.toString()),
                    ethers.utils.parseEther(_standardPrice.toString())
                );
                return true;
            } else return false;
        } catch(err) {
            console.log(err);
            return false;
        }
    }

    private sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    async postOrder(
        _apiId: string,
        _deliveryDay: number,
        _orderTitle: string,
        _orderDesc: string,
        _planTitle: string,
        _planDesc: string,
        _userInfos: string,
        _planPrice: string
        
        ): Promise<boolean> {
        try { 
            if (this.webFiverContract) {
                await this.webFiverContract.postOrder(
                    _apiId,
                    _deliveryDay,
                    _orderTitle,
                    _orderDesc,
                    _planTitle,
                    _planDesc,
                    _userInfos,
                    {value: ethers.utils.parseEther(_planPrice)}
                    );
                
                await this.sleep(15000);
                
                store.dispatch('updateOrdered')

                return true;
            } else return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async acceptOrDeclineWork(_order: Order, _action: string, _declineReason: string): Promise<boolean> {
        try {
            if(this.webFiverContract) {
                console.log(store.state.currentAccount == _order.ordered_by)
                await this.webFiverContract.approveOrDeclineWork(
                    _order.api_id,
                    _order.ordered_at,
                    _action,
                    store.state.currentAccount == _order.ordered_by.toLowerCase() ? true : false,
                    _declineReason,
                    _order.ordered_by
                ) 
                
                await this.sleep(15000);
                store.dispatch('updateOrders')
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async finishOrder(
        _jobId: string,
        _customer: string,
        _orderedAt: number,
        _ipfsHash: string
    ): Promise<boolean> {
        try {
            if(this.webFiverContract) {
                await this.webFiverContract.finishJob(_jobId, _customer, _orderedAt, _ipfsHash)
                
                await this.sleep(15000);
                store.dispatch('updateOrders');
                return true
            } return false;
        } catch(err: any) {
            console.log(err)
            return false
        }
    }
}