import Company from '../models/Company.js';
import Application from '../models/Application.js';
import ApplicationEvent from '../models/ApplicationEvent.js';

export async function getCompanies(req, res) {
  try {
    const { search } = req.query;
    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const companies = await Company.find(query).sort('name');

    // Aggregate applications for each company
    const applications = await Application.find({ userId: req.user._id });

    const companyData = companies.map(comp => {
      const compApps = applications.filter(a => 
        a.companyId?.toString() === comp._id.toString() ||
        a.companyName.toLowerCase() === comp.name.toLowerCase()
      );

      return {
        ...comp.toObject(),
        applicationsCount: compApps.length,
        applications: compApps.map(a => ({
          _id: a._id,
          jobTitle: a.jobTitle,
          status: a.status,
          appliedDate: a.appliedDate,
        })),
      };
    });

    res.status(200).json({
      success: true,
      data: companyData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCompanyById(req, res) {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const applications = await Application.find({
      userId: req.user._id,
      $or: [
        { companyId: company._id },
        { companyName: company.name },
      ],
    }).sort('-appliedDate');

    const appIds = applications.map(a => a._id);
    const recentActivity = await ApplicationEvent.find({
      userId: req.user._id,
      applicationId: { $in: appIds },
    }).sort('-eventDate').limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...company.toObject(),
        applications,
        recentActivity,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCompany(req, res) {
  try {
    const { name, logo, website, industry, location, notes, recruiterContacts } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }

    const existing = await Company.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Company already exists in your workspace.' });
    }

    const company = await Company.create({
      userId: req.user._id,
      name: name.trim(),
      logo: logo || '',
      website: website || '',
      industry: industry || 'Technology',
      location: location || '',
      notes: notes || '',
      recruiterContacts: recruiterContacts || [],
    });

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCompany(req, res) {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    Object.assign(company, req.body);
    await company.save();

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteCompany(req, res) {
  try {
    const company = await Company.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

