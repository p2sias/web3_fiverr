import { ethers } from "ethers";
import abi from "./abi/webThreeSales.json";
import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import Wallet from "./Wallet"
import store from "../../store"

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

    async getOrders(): Promise<any> {
        if (this.webFiverContract) {
            const res: any = await this.webFiverContract.getOrders();
            return res;
        }
    }

    async getOrdered(): Promise<any> {
        if (this.webFiverContract) {
            const res: any = await this.webFiverContract.getOrdered();
            return res;
        }
    }

    async createJob(
        _apiId: string,
        _basicPlan: boolean,
        _premiumPLan: boolean,
        _standardPlan: boolean,
        _basicPrice: number,
        _premiumPrice: number,
        _standardPrice: number
    ): Promise<boolean> {

        try {
            if (this.webFiverContract) {

                console.log(_basicPlan)
                await this.webFiverContract.createJob(
                    _apiId,
                    _basicPlan,
                    _premiumPLan,
                    _standardPlan,
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
        _planDesc: string
        
        ): Promise<boolean> {
        try { 
            if (this.webFiverContract) {
                await this.webFiverContract.postOrder(
                    _apiId,
                    _deliveryDay,
                    _orderTitle,
                    _orderDesc,
                    _planTitle,
                    _planDesc
                );
                
                await this.sleep(15000);

                return true;
            } else return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async payOrder(_apiId: string, _price: string): Promise<boolean> {
        try { 
            if (this.webFiverContract) {
                
                await this.webFiverContract.payOrder(_apiId, {value: ethers.utils.parseEther(_price)});
                return true;
            } else return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }


    /*
    async wave(_message: string): Promise<boolean> {
         try { 
            if (this.wavePortalContract) {
                await this.wavePortalContract.wave(_message, { gasLimit: 300000 });
                return true;
            } else return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async getWaverByAdddress(_address: string): Promise<Waver | null> {
        try { 
            if (this.wavePortalContract) {
                const res: any = await this.wavePortalContract.getWaverByAddress(_address);
                let totalWaves = this.formatHex(res.totalWaves._hex);
                return new Waver(totalWaves, res.pseudo, res.pseudoChanged, res.added);;
            } else return null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async changePseudo(_pseudo: string): Promise<boolean> {
        try { 
            if (this.wavePortalContract) {
                await this.wavePortalContract.changePseudo(_pseudo);
                return true;
            } else return false;
        } catch (err: any) {
            console.log(err);
            return false;
        }
    }

    async getTotalWaves(): Promise<number | null> {
         try { 
            if (this.wavePortalContract) {
                const res: any = await this.wavePortalContract.getTotalWaves();
                return this.formatHex(res._hex);;
            } else return null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async getAllWaves(): Promise<Wave[] | null> {
        const waves: Wave[] = [];
        try { 
            if (this.wavePortalContract) {
                const res: any = await this.wavePortalContract.getAllWaves();

                for (const wave of res) {
                    waves.push({ 
                        message: wave.message,
                        timestamp: this.formatHex(wave.timestamp),
                        waver: new Waver(
                            this.formatHex(wave.waver.totalWaves),
                            wave.waver.pseudo,
                            wave.waver.pseudoChanged,
                            wave.waver.added)
                    })
                }
                return waves
            } else return null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }*/
}