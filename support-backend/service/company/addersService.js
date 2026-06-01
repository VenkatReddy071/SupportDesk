import { createAddress } from "../../repositories/company/address.js";

export const createAddressService=async (addressData,session) => {

    const address = await createAddress(addressData,session);
    return address[0];
};

export const getAddressService=async (addressId) => {
    const address = await Address.findById(addressId);
    return address;
};

export const updateAddressService=async (addressId, addressData) => {
    const address = await Address.findByIdAndUpdate(addressId, addressData, { new: true });
    return address;
};

export const deleteAddressService=async (addressId) => {
    await Address.findByIdAndDelete(addressId);
    return;
};