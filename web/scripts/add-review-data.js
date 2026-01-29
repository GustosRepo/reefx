const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = 'ef0d5c53-11b5-4e75-b657-08362d366df3';

(async () => {
  console.log('📊 Adding sample data for Apple Review account...\n');

  // Get the active tank
  const { data: tanks } = await supabase
    .from('tanks')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1);

  if (!tanks || tanks.length === 0) {
    console.error('❌ No tank found');
    process.exit(1);
  }

  const tankId = tanks[0].id;

  // 1. Add reef parameter logs
  console.log('📊 Adding parameter logs...');
  const logs = [
    {
      user_id: userId,
      tank_id: tankId,
      log_date: '2026-01-25',
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
      log_date: '2026-01-22',
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
      log_date: '2026-01-19',
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
    console.error('❌ Logs error:', logsError);
  } else {
    console.log(`✅ ${logs.length} parameter logs added`);
  }

  // 2. Add maintenance entries
  console.log('🔧 Adding maintenance...');
  const maintenance = [
    {
      user_id: userId,
      tank_id: tankId,
      task: 'Water Change',
      description: '20% water change with RODI water',
      due_date: '2026-01-28',
      completed_date: '2026-01-28',
      status: 'completed',
      repeat_interval: 7,
    },
    {
      user_id: userId,
      tank_id: tankId,
      task: 'Clean Protein Skimmer',
      description: 'Empty collection cup and clean neck',
      due_date: '2026-01-26',
      completed_date: '2026-01-26',
      status: 'completed',
      repeat_interval: 3,
    },
    {
      user_id: userId,
      tank_id: tankId,
      task: 'Replace Filter Media',
      description: 'Change carbon and GFO',
      due_date: '2026-02-05',
      status: 'pending',
      repeat_interval: 30,
    },
  ];

  const { error: maintError } = await supabase.from('maintenance').insert(maintenance);
  if (maintError) {
    console.error('❌ Maintenance error:', maintError);
  } else {
    console.log(`✅ ${maintenance.length} maintenance entries added`);
  }

  // 3. Add livestock
  console.log('🐠 Adding livestock...');
  const livestock = [
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Clownfish Pair',
      type: 'fish',
      species: 'Ocellaris Clownfish',
      scientific_name: 'Amphiprion ocellaris',
      date_added: '2025-12-15',
      source: 'Local Fish Store',
      cost: 49.99,
      status: 'healthy',
      size: '2 inches',
      temperament: 'peaceful',
      notes: 'Hosting in Duncan coral',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Purple Tang',
      type: 'fish',
      species: 'Purple Tang',
      scientific_name: 'Zebrasoma xanthurum',
      date_added: '2026-01-05',
      source: 'Online Retailer',
      cost: 129.99,
      status: 'healthy',
      size: '3 inches',
      temperament: 'semi-aggressive',
      notes: 'Beautiful coloration',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Montipora Cap',
      type: 'coral',
      species: 'Montipora Capricornis',
      scientific_name: 'Montipora capricornis',
      date_added: '2026-01-10',
      source: 'Local Frag Swap',
      cost: 25.00,
      status: 'healthy',
      notes: 'Red cap on upper rockwork. Fast growing SPS.',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Duncan Colony',
      type: 'coral',
      species: 'Duncan Coral',
      scientific_name: 'Duncanopsammia axifuga',
      date_added: '2025-12-20',
      source: 'Local Fish Store',
      cost: 45.00,
      status: 'healthy',
      notes: 'Green/Purple coloration. Mid-level placement. 8 heads and growing.',
    },
  ];

  const { error: livestockError } = await supabase.from('livestock').insert(livestock);
  if (livestockError) {
    console.error('❌ Livestock error:', livestockError);
  } else {
    console.log(`✅ ${livestock.length} livestock entries added`);
  }

  console.log('\n🎉 Sample data added successfully!');
})();
