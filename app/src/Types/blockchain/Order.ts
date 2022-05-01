export default interface Order {
    api_id: string,
    delivery_day: number,
    worker_address: string,
    title: string,
    plan_title: string,
    price: number,
    plan_desc: string,
    status: string,
    desc: string,
    payed: boolean,
    customer_accepted: boolean,
    accepted: boolean,
    accepted_at: number,
    ordered_at: number

}