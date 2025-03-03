export interface ICategory {
    _id?: string;
    name: string;
    image?: string;
    description?: string;
    order?: number;
    subCategories?: ISubCategory[];
}
export interface ISubCategory {
    name: string;
    image?: string;
    description?: string;
}  
