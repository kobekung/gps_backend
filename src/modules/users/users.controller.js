const service = require('./users.service')
const { success, error } = require('../../utils/response')

const getByCompany = async (req, res) => {
  try {
    const company_id = req.user.role === 'superadmin' ? req.params.companyId : req.user.company_id
    console.log(company_id);
    
    const data = await service.getUsersByCompany(company_id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const createDriver = async (req, res) => {
  try {
    console.log(req.body)
    const company_id = req.user.company_id
    console.log(company_id)
    const driver = await service.createDriver(company_id, req.body)
    return success(res, driver, 'Driver created', 201)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const updateUser = async (req, res) => {
  try {
    const data = await service.updateUser(req.params.id, req.body)
    return success(res, data, 'User updated')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}
const updateProfile = async (req, res) => {
  try {
    // console.log("body===",req.body);
    const userId = req.user.id; // ดึง ID จาก Token ของคนที่ล็อกอินอยู่
    const { full_name, phone } = req.body;
    
    
    // เรียกใช้ฟังก์ชันอัปเดต
    const updatedUser = await service.updateUser(userId, { full_name, phone });
    return success(res, updatedUser, 'Profile updated successfully');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

module.exports = { getByCompany, createDriver, updateUser,updateProfile }
