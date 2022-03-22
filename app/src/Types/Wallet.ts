import { Web3Provider} from "@ethersproject/providers";
import { ethers } from "ethers";
import store from "../store"

export default class Wallet {
    provider: Web3Provider | null = null;

    constructor() {
        const { ethereum } = window as any;
        this.provider = new ethers.providers.Web3Provider(ethereum, "any");

        if (this.provider) {
            this.provider.on("network", (newNetwork, oldNetwork) => {
                if (oldNetwork) window.location.reload();
            })
        }

        ethereum.on('accountsChanged', () => {
            this.connect()
        })
    }

    async getNetwork(): Promise<string> {
        if (this.provider){   
            const network = await this.provider.getNetwork();
            return network.name
        } else return "network.not.found"
    }

    getEthClient(): any {
        try {
            const { ethereum } = window as any;

            if (!ethereum) {
                console.log("MetaMask not installed !");
                return null;
            }

            return ethereum;

        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async connect(): Promise<Wallet | null> {
        const _ethereum = this.getEthClient();
        try {
            if (_ethereum) {
                const accounts = await _ethereum.request({ method: "eth_requestAccounts" });
                await store.dispatch('setAccount', accounts[0]);
                return this;
            } 
        } catch (err) {
            console.log(err);
        }
        return null;
    }

    async connected(): Promise<boolean> {
        const _ethereum = this.getEthClient();
        try {
            if (!_ethereum) {
                return false;
            } 
            const accounts = await _ethereum.request({ method: "eth_accounts" });

            if (accounts.length !== 0) {
                const account = accounts[0];
                await store.dispatch('setAccount', account);
                return true;
            } else
            {
                console.log("No authorized accounts founded !");
                return false;
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

}