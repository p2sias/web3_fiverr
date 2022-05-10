export default interface Order {
    api_id: string,
    delivery_day: number,
    worker_address: string,
    ordered_by: string,
    title: string,
    plan_title: string,
    price: number,
    plan_desc: string,
    status: string,
    ipfs_hash: string,
    desc: string,
    decline_reason: string,
    user_infos: string,
    customer_accepted: boolean,
    accepted: boolean,
    accepted_at: number,
    ordered_at: number

}