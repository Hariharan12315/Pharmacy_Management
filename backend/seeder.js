const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Medicine = require('./models/Medicine');

dotenv.config();
connectDB();

const seed = async () => {
  try {
    await User.deleteMany();
    await Medicine.deleteMany();

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@pharmacy.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'John Pharmacist',
      email: 'pharmacist@pharmacy.com',
      password: 'pharma123',
      role: 'pharmacist',
    });

    await User.create({
      name: 'Jane Cashier',
      email: 'cashier@pharmacy.com',
      password: 'cash123',
      role: 'cashier',
    });

    await Medicine.create([
      {
        name: 'Paracetamol 500mg',
        batchNumber: 'PARA-001',
        category: 'Analgesic',
        manufacturer: 'Cipla',
        supplier: 'MedSupply Co.',
        expiryDate: new Date('2027-06-30'),
        stockQuantity: 150,
        reorderLevel: 30,
        price: 25,
        costPrice: 15,
        createdBy: admin._id,
      },
      {
        name: 'Amoxicillin 250mg',
        batchNumber: 'AMOX-002',
        category: 'Antibiotic',
        manufacturer: 'Sun Pharma',
        supplier: 'HealthDist Ltd.',
        expiryDate: new Date('2026-12-15'),
        stockQuantity: 15,
        reorderLevel: 20,
        price: 85,
        costPrice: 55,
        createdBy: admin._id,
      },
      {
        name: 'Cetirizine 10mg',
        batchNumber: 'CETI-003',
        category: 'Antihistamine',
        manufacturer: "Dr. Reddy's",
        supplier: 'MedSupply Co.',
        expiryDate: new Date('2027-03-20'),
        stockQuantity: 8,
        reorderLevel: 25,
        price: 40,
        costPrice: 22,
        createdBy: admin._id,
      },
      {
        name: 'Vitamin C 1000mg',
        batchNumber: 'VITC-004',
        category: 'Supplement',
        manufacturer: 'HealthVit',
        supplier: 'WellnessDist',
        expiryDate: new Date('2027-09-10'),
        stockQuantity: 200,
        reorderLevel: 40,
        price: 120,
        costPrice: 80,
        createdBy: admin._id,
      },
    ]);

    console.log('Data Seeded Successfully!');
    console.log('Login with: admin@pharmacy.com / admin123');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seed();
