const Vendor = require("../models/VendorModel");
const User = require("../models/UserModel");
const argon2 = require("argon2");
const Lead = require("../models/LeadModel");
const sequelize = require("../config/Database.js");
const { Op } = require("sequelize");


const createVendor = async (req, res) => {
    const { name, email, password, confPassword, mobile, address, createdBy, isDummy } = req.body;

    if (password !== confPassword) {
        return res.status(400).json({ msg: "Password and Confirm Password do not match" });
    }

    try {
        // Check if user with the given email already exists
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ msg: "User with this email already exists" });
        }

        const hashPassword = await argon2.hash(password);

        // Step 1: Create User with role 'vendor'
        const user = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: 'vendor',
            createdBy: createdBy,
            copyofpassword: password
        });

        // Step 2: Generate vendorCode
        let newVendorCode;
        if (isDummy) {
            const highestDummyCode = await Vendor.findOne({
                attributes: [[sequelize.fn('MAX', sequelize.col('vendorCode')), 'maxVendorCode']],
                where: {
                    vendorCode: {
                        [Op.like]: 'DUMMY%'
                    }
                },
                raw: true
            });

            let newDummyCodeNumber = 1;
            if (highestDummyCode && highestDummyCode.maxVendorCode) {
                const highestCode = highestDummyCode.maxVendorCode;
                const numberPart = highestCode.replace('DUMMY', '');
                if (!isNaN(numberPart)) {
                    newDummyCodeNumber = parseInt(numberPart) + 1;
                }
            }
            newVendorCode = `DUMMY${newDummyCodeNumber}`;
        } else {
            const highestVendorCode = await Vendor.findOne({
                attributes: [[sequelize.fn('MAX', sequelize.col('vendorCode')), 'maxVendorCode']],
                where: {
                    vendorCode: {
                        [Op.like]: 'PRIMESCAPITAL%'
                    }
                },
                raw: true
            });

            let newVendorCodeNumber = 1;
            if (highestVendorCode && highestVendorCode.maxVendorCode) {
                const highestCode = highestVendorCode.maxVendorCode;
                const numberPart = highestCode.replace('PRIMESCAPITAL', '');
                if (!isNaN(numberPart)) {
                    newVendorCodeNumber = parseInt(numberPart) + 1;
                }
            }
            newVendorCode = `PRIMESCAPITAL${newVendorCodeNumber}`;
        }

        // Step 3: Create Vendor with the User's UUID and the new vendorCode
        const vendor = await Vendor.create({
            uuid: user.uuid,
            vendorCode: newVendorCode,
            name: name,
            email: email,
            mobile: mobile,
            address: address,
            isDummy: isDummy
        });

        res.status(201).json({ msg: "Vendor created successfully", vendor });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: error.message });
    }
};



const getVendors = async (req, res) => {
    try {
        // Check if user is authenticated
        // if (!req.user) {
        //     return res.status(401).json({ msg: "Unauthorized: User not authenticated" });
        // }

        // // Check if user has the necessary permissions (e.g., admin role)
        // if (req.user.role !== 'representative') {
        //     return res.status(403).json({ msg: "Forbidden: User does not have permission to access vendors" });
        // }

        // Fetch vendors along with their associated users
        const response = await Vendor.findAll({
            attributes: ['uuid', 'vendorCode', 'name', 'email', 'mobile', 'address', 'isDummy'],
            include: {
                model:  User,
                attributes: ['uuid', 'name', 'email', 'role']
            }
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({
            where: {
                uuid: req.params.id
            },
            include: {
                model: User,
                attributes: ['uuid', 'name', 'email', 'role']
            }
        });

        if (!vendor) {
            return res.status(404).json({ msg: "Vendor not found" });
        }

        res.status(200).json(vendor);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({
            where: {
                uuid: req.params.id
            }
        });

        if (!vendor) {
            return res.status(404).json({ msg: "Vendor not found" });
        }

        if (req.user.role !== 'admin' && vendor.uuid !== req.user.uuid) {
            return res.status(403).json({ msg: "You are not authorized to update this vendor" });
        }

        const { name, email, mobile, address } = req.body;
        vendor.name = name || vendor.name;
        vendor.email = email || vendor.email;
        vendor.mobile = mobile || vendor.mobile;
        vendor.address = address || vendor.address;

        await vendor.save();
        res.status(200).json({ msg: "Vendor updated successfully" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const deleteVendor = async (req, res) => {
    try {
        const vendor = await User.findOne({
            where: {
                uuid: req.params.id
            }
        });

        if (!vendor) {
            return res.status(404).json({ msg: "Vendor not found" });
        }
        const forDummy = await Vendor.findOne({
            where: {
                uuid: req.params.id
            }
        });

        if (!forDummy.isDummy) {
            return res.status(403).json({ msg: "You are not authorized to delete this vendor" });
        }

        if (req.user.role !== 'representative' && vendor.uuid !== req.user.uuid) {
            return res.status(403).json({ msg: "You are not authorized to delete this vendor" });
        }

        await User.destroy({
            where: {
                uuid: req.params.id
            }
        });

        res.status(200).json({ msg: "Vendor deleted successfully" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


const getRoleCounts = async (req, res) => {
    try {
        const uuid = req.user.uuid;
        const leadCount = await Lead.count({ where: { createdBy: uuid } });
        const dealCount = await Lead.count({
            where: {
                lead_status: 'Trade Done',
                createdBy: uuid
            }
        });

        const data = {
            lead: leadCount,
            deal: dealCount
        }

        res.status(200).json({
            data
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};



module.exports = {
    createVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
    getRoleCounts
};
