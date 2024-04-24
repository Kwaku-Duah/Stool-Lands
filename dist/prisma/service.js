"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPayableServices = void 0;
const db_1 = __importDefault(require("../src/dbConfig/db"));
async function seedPayableServices() {
    try {
        const existingPayableServices = await db_1.default.payableService.findMany();
        if (existingPayableServices.length === 0) {
            const payableServicesData = [
                {
                    code: 'individual',
                    name: 'Individual',
                    amount: 0.1,
                    currency: 'cedis',
                    tags: ['form'],
                    description: 'Payment for form',
                },
                {
                    code: 'organization',
                    name: 'Organization',
                    amount: 0.2,
                    currency: 'cedis',
                    tags: ['form'], // Specify as a string array
                    description: 'Payment for form',
                },
                {
                    code: 'joint',
                    name: 'Joint',
                    amount: 0.3,
                    currency: 'cedis',
                    tags: ['form'], // Specify as a string array
                    description: 'Payment for form',
                },
                {
                    code: 'processingFee',
                    name: 'ProcessingFee',
                    amount: 0.1,
                    currency: 'cedis',
                    tags: ['processing'], // Specify as a string array
                    description: 'Processing Fee',
                },
                {
                    code: 'drinksFee',
                    name: 'DrinksFee',
                    amount: 0.1,
                    currency: 'cedis',
                    tags: ['drinks'], // Specify as a string array
                    description: 'Drinks Fee',
                },
                {
                    code: 'inspectionFee',
                    name: 'InspectionFee',
                    amount: 0.1,
                    currency: 'cedis',
                    tags: ['inspection'], // Specify as a string array
                    description: 'Payment for form',
                }
            ];
            const createdPayableServices = await db_1.default.payableService.createMany({
                data: payableServicesData,
            });
            console.log('Payable services seeded successfully:', createdPayableServices);
        }
        else {
            console.log('Payable services already exist in the database.');
        }
    }
    catch (error) {
        console.error('Error seeding payable services:', error);
    }
    finally {
        await db_1.default.$disconnect();
    }
}
exports.seedPayableServices = seedPayableServices;
seedPayableServices();
