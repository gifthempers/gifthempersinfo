const Registration = require('../models/Registration');
const XLSX = require('xlsx');

// Get all registrations for admin
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    
    const formattedRegistrations = registrations.map(reg => ({
      registrationNumber: reg.registrationNumber,
      fullName: reg.fullName,
      email: reg.email,
      contactNumber: reg.contactNumber,
      department: reg.getDepartmentFullName(),
      ken: reg.ken,
      foodPreference: reg.foodPreference,
      registrationType: reg.registrationType,
      accommodation: reg.accommodation,
      isVerified: reg.isVerified,
      verifiedNumber: reg.verifiedNumber,
      registrationDate: reg.registrationDate,
      verificationDate: reg.verificationDate,
      createdBy: reg.createdBy
    }));

    res.status(200).json({
      success: true,
      data: formattedRegistrations,
      totalCount: registrations.length,
      verifiedCount: registrations.filter(reg => reg.isVerified).length,
      unverifiedCount: registrations.filter(reg => !reg.isVerified).length
    });

  } catch (error) {
    console.error('Admin get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations.'
    });
  }
};

// Export registrations to Excel
const exportToExcel = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    
    const excelData = registrations.map(reg => ({
      'Registration Number': reg.registrationNumber,
      'Full Name': reg.fullName,
      'Email': reg.email,
      'Contact Number': reg.contactNumber,
      'Department': reg.getDepartmentFullName(),
      'KEN': reg.ken,
      'Food Preference': reg.foodPreference,
      'Registration Type': reg.registrationType,
      'Accommodation': reg.accommodation,
      'Verified': reg.isVerified ? 'Yes' : 'No',
      'Verified Number': reg.verifiedNumber || 'N/A',
      'Registration Date': reg.registrationDate,
      'Verification Date': reg.verificationDate || 'N/A',
      'Created By': reg.createdBy
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=bvb-registrations.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data.'
    });
  }
};

// Create manual registration (admin only)
const createManualRegistration = async (req, res) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      department,
      ken,
      foodPreference,
      registrationType,
      accommodation
    } = req.body;

    // Check if KEN already exists
    const existingKEN = await Registration.findOne({ ken: ken.toUpperCase() });
    if (existingKEN) {
      return res.status(400).json({
        success: false,
        message: 'KEN already registered.'
      });
    }

    // Check if email already exists
    const existingEmail = await Registration.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Generate unique registration number
    let registrationNumber;
    let isUnique = false;
    
    while (!isUnique) {
      registrationNumber = Registration.generateRegistrationNumber();
      const existing = await Registration.findOne({ registrationNumber });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create new manual registration
    const registration = new Registration({
      registrationNumber,
      fullName: fullName.toUpperCase(),
      email: email.toLowerCase(),
      contactNumber,
      department,
      ken: ken.toUpperCase(),
      foodPreference,
      registrationType,
      accommodation,
      createdBy: 'admin'
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Manual registration created successfully!',
      data: {
        registrationNumber,
        fullName: registration.fullName,
        email: registration.email,
        contactNumber: registration.contactNumber,
        department: registration.getDepartmentFullName(),
        ken: registration.ken
      }
    });

  } catch (error) {
    console.error('Manual registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Manual registration failed. Please try again.'
    });
  }
};

// Get registration statistics
const getStatistics = async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    const verifiedRegistrations = await Registration.countDocuments({ isVerified: true });
    const unverifiedRegistrations = await Registration.countDocuments({ isVerified: false });
    
    const departmentStats = await Registration.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const registrationTypeStats = await Registration.aggregate([
      {
        $group: {
          _id: '$registrationType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRegistrations,
        verifiedRegistrations,
        unverifiedRegistrations,
        departmentStats,
        registrationTypeStats
      }
    });

  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics.'
    });
  }
};

module.exports = {
  getAllRegistrations,
  exportToExcel,
  createManualRegistration,
  getStatistics
};