import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedDatabase() {
  console.log('🌊 Starting ReefX database seeding...\n');

  // Get all users to seed for the first one
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (profilesError || !profiles || profiles.length === 0) {
    console.error('❌ No user profiles found. Please sign up first.');
    process.exit(1);
  }

  const userId = profiles[0].id;
  console.log(`✅ Seeding for User ID: ${userId}\n`);

  // 1. Create a tank first
  console.log('🏊 Creating tank...');
  const { data: tank, error: tankError } = await supabase
    .from('tanks')
    .insert({
      user_id: userId,
      name: 'Main Reef Tank',
      size_gallons: 75,
      type: 'reef',
      setup_date: '2024-01-15',
      notes: 'Mixed reef with LPS and SPS corals',
      is_active: true,
    })
    .select()
    .single();

  if (tankError) {
    console.error('❌ Tank creation failed:', tankError.message);
    process.exit(1);
  }
  console.log(`✅ Tank created: ${tank.name}\n`);

  const tankId = tank.id;

  // 2. Add reef parameter logs
  console.log('📊 Adding reef parameter logs...');
  const logs = [
    {
      user_id: userId,
      tank_id: tankId,
      log_date: '2024-12-01',
      temp: 77.5,
      salinity: 1.025,
      ph: 8.2,
      alk: 8.5,
      cal: 420,
      mag: 1350,
      po4: 0.03,
      no3: 5,
    },
    {
      user_id: userId,
      tank_id: tankId,
      log_date: '2024-12-04',
      temp: 78.0,
      salinity: 1.025,
      ph: 8.1,
      alk: 8.2,
      cal: 410,
      mag: 1340,
      po4: 0.05,
      no3: 8,
    },
    {
      user_id: userId,
      tank_id: tankId,
      log_date: '2024-12-07',
      temp: 77.8,
      salinity: 1.026,
      ph: 8.3,
      alk: 8.8,
      cal: 430,
      mag: 1360,
      po4: 0.04,
      no3: 6,
    },
  ];

  const { error: logsError } = await supabase.from('reef_logs').insert(logs);
  if (logsError) {
    console.error('❌ Logs creation failed:', logsError.message);
  } else {
    console.log(`✅ ${logs.length} reef logs added\n`);
  }

  // 3. Add maintenance entries
  console.log('🔧 Adding maintenance entries...');
  const maintenance = [
    {
      user_id: userId,
      tank_id: tankId,
      task: 'Water Change',
      description: '10 gallon water change',
      due_date: '2024-12-07',
      completed_date: '2024-12-07',
      status: 'completed',
      repeat_interval: 7,
    },
    {
      user_id: userId,
      tank_id: tankId,
      task: 'Clean Protein Skimmer',
      description: 'Empty cup and clean neck',
      due_date: '2024-12-05',
      completed_date: '2024-12-05',
      status: 'completed',
      repeat_interval: 3,
    },
    {
      user_id: userId,
      tank_id: tankId,
      task: 'Replace Carbon',
      description: 'Change activated carbon in reactor',
      due_date: '2024-12-10',
      status: 'pending',
      repeat_interval: 30,
    },
    {
      user_id: userId,
      tank_id: tankId,
      task: 'Clean Glass',
      description: 'Scrape algae and clean viewing panel',
      due_date: '2024-11-25',
      status: 'pending',
      repeat_interval: 2,
    },
  ];

  const { error: maintenanceError } = await supabase.from('maintenance').insert(maintenance);
  if (maintenanceError) {
    console.error('❌ Maintenance creation failed:', maintenanceError.message);
  } else {
    console.log(`✅ ${maintenance.length} maintenance entries added\n`);
  }

  // 4. Add equipment
  console.log('⚙️  Adding equipment...');
  const equipment = [
    {
      user_id: userId,
      tank_id: tankId,
      name: 'AI Prime 16HD',
      category: 'lighting',
      brand: 'Aqua Illumination',
      model: 'Prime 16HD',
      purchase_date: '2024-01-10',
      purchase_price: 249.99,
      warranty_expires: '2025-01-10',
      status: 'active',
      notes: 'Running at 60% intensity',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Reef Octopus Classic 110',
      category: 'filtration',
      brand: 'Reef Octopus',
      model: 'Classic 110INT',
      purchase_date: '2024-01-15',
      purchase_price: 199.99,
      status: 'active',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Eheim Jager 150W',
      category: 'heating',
      brand: 'Eheim',
      model: 'Jager 3616',
      purchase_date: '2024-01-12',
      purchase_price: 34.99,
      warranty_expires: '2026-01-12',
      status: 'active',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'MP40 QD',
      category: 'pump',
      brand: 'EcoTech Marine',
      model: 'MP40wQD',
      purchase_date: '2024-02-01',
      purchase_price: 449.99,
      warranty_expires: '2026-02-01',
      status: 'active',
      notes: 'Running reef crest mode',
    },
  ];

  const { error: equipmentError } = await supabase.from('equipment').insert(equipment);
  if (equipmentError) {
    console.error('❌ Equipment creation failed:', equipmentError.message);
  } else {
    console.log(`✅ ${equipment.length} equipment items added\n`);
  }

  // 5. Add livestock
  console.log('🐠 Adding livestock...');
  const livestock = [
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Nemo',
      type: 'fish',
      species: 'Ocellaris Clownfish',
      scientific_name: 'Amphiprion ocellaris',
      date_added: '2024-02-15',
      source: 'Local Fish Store',
      cost: 29.99,
      status: 'healthy',
      size: '2 inches',
      temperament: 'peaceful',
      notes: 'Hosting in hammer coral',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Dory',
      type: 'fish',
      species: 'Yellow Tang',
      scientific_name: 'Zebrasoma flavescens',
      date_added: '2024-03-01',
      source: 'Online Retailer',
      cost: 89.99,
      status: 'healthy',
      size: '3 inches',
      temperament: 'semi-aggressive',
      notes: 'Very active grazer',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Emerald Crab',
      type: 'invert',
      species: 'Emerald Crab',
      scientific_name: 'Mithraculus sculptus',
      date_added: '2024-02-20',
      source: 'Local Fish Store',
      cost: 12.99,
      status: 'healthy',
      temperament: 'peaceful',
      notes: 'Great for bubble algae control',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Hammer Coral',
      type: 'coral',
      species: 'Hammer Coral',
      scientific_name: 'Euphyllia ancora',
      date_added: '2024-03-15',
      source: 'Coral Frag Swap',
      cost: 45.00,
      status: 'healthy',
      size: '3 head colony',
      temperament: 'peaceful',
      notes: 'Excellent extension and feeding response',
    },
  ];

  const { error: livestockError } = await supabase.from('livestock').insert(livestock);
  if (livestockError) {
    console.error('❌ Livestock creation failed:', livestockError.message);
  } else {
    console.log(`✅ ${livestock.length} livestock entries added\n`);
  }



  console.log('🎉 Database seeding completed successfully!\n');
  console.log('You can now view all the data in your ReefX app.');
}

seedDatabase().catch(console.error);
