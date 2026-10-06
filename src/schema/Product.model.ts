import mongoose from "mongoose";
import { ProductCollection, ProductSize, ProductStatus, ProductValume } from "../libs/enums/productEnum";

const { Schema } = mongoose;

const productSchema = new Schema(
    {
        productStatus: {
            type: String,
            enum: ProductStatus,
            default: ProductStatus.PAUSE,
        },

        productCollection: {
            type: String,
            enum: ProductCollection,
            required: true,
        },

        productName: {
            type: String,
            required: true,
        },

        productPrice: {
            type: Number,
            required: true,
        },

        productCount: {
            type: Number,
            required: true,
        },

        productSize: {
            type: String,
            enum: ProductSize,
            default: ProductSize.NORMAL,
        },

        productVolume: {
            type: String,
            enum: ProductValume,
            default: ProductValume.ONE
        },

        productDesc: {
            type: String,
            required: true,
        },

        productImages: {
            type: [String],
            default: [],
        },

        productViews: {
            type: Number,
            default: 0,
        }
    },
    {timestamps: true} // update, create
);

productSchema.index(
    {productName: 1, ProductSize: 1, ProductValume: 1}, 
    {unique: true});
export default mongoose.model("Product", productSchema);