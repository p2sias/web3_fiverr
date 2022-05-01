export interface JobPlan {
    type: string,
    price: number,
    plan_desc: string,
    max_delivery_day: number
}

export interface Job {
    _id?: string,
    title: string,
    about: string,
    photos: string[],
    user: string,
    plans: JobPlan[],
    user_address: string,
    category: string
}