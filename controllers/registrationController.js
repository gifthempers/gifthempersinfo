const Registration = require('../models/Registration');
const { sendRegistrationEmail, sendAdminNotification, sendVerificationEmail } = require('../config/email');

// Create new registration
const createRegistration = async (req, res) => {
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
        message: 'KEN already registered. Please use a different KEN.'
      });
    }

    // Check if email already exists
    const existingEmail = await Registration.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email.'
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

    // Create new registration
    const registration = new Registration({
      registrationNumber,
      fullName: fullName.toUpperCase(),
      email: email.toLowerCase(),
      contactNumber,
      department,
      ken: ken.toUpperCase(),
      foodPreference,
      registrationType,
      accommodation
    });

    await registration.save();

    // Prepare registration data for emails
    const registrationData = {
      registrationNumber,
      fullName: fullName.toUpperCase(),
      email: email.toLowerCase(),
      contactNumber,
      department: registration.getDepartmentFullName(),
      ken: ken.toUpperCase(),
      foodPreference,
      registrationType,
      accommodation
    };

    // Send emails
    try {
      await sendRegistrationEmail(email, registrationData);
      await sendAdminNotification(registrationData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        registrationNumber,
        fullName: registration.fullName,
        email: registration.email,
        contactNumber: registration.contactNumber,
        department: registration.getDepartmentFullName(),
        ken: registration.ken,
        foodPreference: registration.foodPreference,
        registrationType: registration.registrationType,
        accommodation: registration.accommodation,
        registrationDate: registration.registrationDate
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// Validate registration by KEN
const validateRegistration = async (req, res) => {
  try {
    const { ken } = req.body;

    if (!ken) {
      return res.status(400).json({
        success: false,
        message: 'KEN is required.'
      });
    }

    const registration = await Registration.findOne({ ken: ken.toUpperCase() });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'No registration found with this KEN.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration found!',
      data: {
        registrationNumber: registration.registrationNumber,
        fullName: registration.fullName,
        email: registration.email,
        contactNumber: registration.contactNumber,
        department: registration.getDepartmentFullName(),
        isVerified: registration.isVerified,
        verifiedNumber: registration.verifiedNumber,
        registrationDate: registration.registrationDate
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed. Please try again.'
    });
  }
};

// Verify registration
const verifyRegistration = async (req, res) => {
  try {
    const { registrationNumber, contactNumber } = req.body;

    if (!registrationNumber || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Registration number and contact number are required.'
      });
    }

    const registration = await Registration.findOne({ 
      registrationNumber,
      contactNumber 
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'No matching registration found with provided details.'
      });
    }

    // if (registration.isVerified) {
    //   return res.status(200).json({
    //     success: true,
    //     message: 'Registration already verified!',
    //     data: {
    //       verifiedNumber: registration.verifiedNumber,
    //       registrationNumber: registration.registrationNumber,
    //       fullName: registration.fullName,
    //       verificationDate: registration.verificationDate
    //     }
    //   });
    // }

    // Generate unique verified number
    let verifiedNumber;
    let isUnique = false;
    
    while (!isUnique) {
      verifiedNumber = Registration.generateVerifiedNumber();
      const existing = await Registration.findOne({ verifiedNumber });
      if (!existing) {
        isUnique = true;
      }
    }

    // Update registration with verification details
    registration.isVerified = true;
    registration.verifiedNumber = verifiedNumber;
    registration.verificationDate = new Date();
    
    await registration.save();

    // Send verification emails
    const verificationData = {
      verifiedNumber,
      registrationNumber: registration.registrationNumber,
      fullName: registration.fullName
    };

    try {
      await sendVerificationEmail(registration.email, verificationData);
      await sendAdminNotification({
        ...verificationData,
        email: registration.email,
        contactNumber: registration.contactNumber,
        department: registration.getDepartmentFullName(),
        ken: registration.ken,
        action: 'VERIFIED'
      });
    } catch (emailError) {
      console.error('Verification email sending failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Registration verified successfully!',
      data: {
        verifiedNumber,
        registrationNumber: registration.registrationNumber,
        fullName: registration.fullName,
        email: registration.email,
        verificationDate: registration.verificationDate
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
};

module.exports = {
  createRegistration,
  validateRegistration,
  verifyRegistration
};