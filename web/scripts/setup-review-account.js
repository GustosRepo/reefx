const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = 'ef0d5c53-11b5-4e75-b657-08362d366df3';

(async () => {
  console.log('🍎 Setting up Apple Review account...\n');

  // 1. Verify email
  const { error: verifyError } = await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true
  });
  if (verifyError) {
    console.error('❌ Verify error:', verifyError);
    process.exit(1);
  }
  console.log('✅ Email verified');

  // 2. Set to super-premium
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      tier: 'super-premium',
      status: 'active',
      platform: 'web',
      current_period_end: '2027-12-31T23:59:59Z',
      cancel_at_period_end: false,
      stripe_subscription_id: null,
      revenuecat_product_id: null,
    })
    .eq('user_id', userId);
  if (subError) {
    console.error('❌ Subscription error:', subError);
    process.exit(1);
  }
  console.log('✅ Super Premium activated');

  // 3. Seed sample data
  console.log('\n🏊 Creating sample tank...');
  const { data: tank, error: tankError } = await supabase
    .from('tanks')
    .insert({
      user_id: userId,
      name: 'Demo Reef Tank',
      size_gallons: 90,
      type: 'reef',
      setup_date: '2025-01-01',
      notes: 'Mixed reef with LPS, SPS, and soft corals. Demo tank for Apple Review.',
      is_active: true,
    })
    .select()
    .single();

  if (tankError) {
    console.error('❌ Tank error:', tankError);
    process.exit(1);
  }
  console.log('✅ Tank created:', tank.name);

  // 4. Add parameter logs
  const tankId = tank.id;
  const logs = [];
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i * 3);
    logs.push({
      user_id: userId,
      tank_id: tankId,
      logged_at: date.toISOString(),
      salinity: 1.025,
      temperature: 78 + Math.random() * 2,
      ph: 8.1 + Math.random() * 0.3,
      ammonia: 0,
      nitrite: 0,
      nitrate: 5 + Math.random() * 10,
      calcium: 420 + Math.random() * 20,
      alkalinity: 8 + Math.random() * 2,
      magnesium: 1350 + Math.random() * 50,
      phosphate: 0.03 + Math.random() * 0.02,
    });
  }

  const { error: logsError } = await supabase.from('logs').insert(logs);
  if (logsError) {
    console.error('❌ Logs error:', logsError);
  } else {
    console.log(`✅ ${logs.length} parameter logs added`);
  }

  // 5. Add maintenance entries
  const maintenance = [
    {
      user_id: userId,
      tank_id: tankId,
      task_type: 'water_change',
      description: '20% water change with new salt mix',
      completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      tank_id: tankId,
      task_type: 'cleaning',
      description: 'Cleaned glass and trimmed chaeto in refugium',
      completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: userId,
      tank_id: tankId,
      task_type: 'equipment',
      description: 'Replaced filter socks and carbon media',
      completed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const { error: maintError } = await supabase.from('maintenance').insert(maintenance);
  if (maintError) {
    console.error('❌ Maintenance error:', maintError);
  } else {
    console.log(`✅ ${maintenance.length} maintenance entries added`);
  }

  // 6. Add equipment
  const equipment = [
    {
      user_id: userId,
      tank_id: tankId,
      name: 'EcoTech MP40',
      category: 'pump',
      notes: 'Main circulation pump - ReefCrest mode',
      purchase_date: '2025-01-15',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Neptune Apex',
      category: 'controller',
      notes: 'Monitoring and automation system',
      purchase_date: '2025-01-10',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'AI Hydra 32',
      category: 'lighting',
      notes: 'LED light fixture - LPS/SPS spectrum',
      purchase_date: '2025-01-05',
    },
  ];

  const { error: equipError } = await supabase.from('equipment').insert(equipment);
  if (equipError) {
    console.error('❌ Equipment error:', equipError);
  } else {
    console.log(`✅ ${equipment.length} equipment items added`);
  }

  // 7. Add livestock
  const livestock = [
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Ocellaris Clownfish Pair',
      type: 'fish',
      scientific_name: 'Amphiprion ocellaris',
      quantity: 2,
      added_date: '2025-01-20',
      notes: 'Hosting in Duncan coral',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Purple Tang',
      type: 'fish',
      scientific_name: 'Zebrasoma xanthurum',
      quantity: 1,
      added_date: '2025-02-01',
      notes: 'Loves nori sheets',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Montipora Capricornis',
      type: 'coral',
      scientific_name: 'Montipora capricornis',
      quantity: 1,
      added_date: '2025-01-25',
      notes: 'Red cap - growing well under medium light',
    },
    {
      user_id: userId,
      tank_id: tankId,
      name: 'Duncan Coral Colony',
      type: 'coral',
      scientific_name: 'Duncanopsammia axifuga',
      quantity: 1,
      added_date: '2025-01-18',
      notes: 'Large colony with 12+ heads',
    },
  ];

  const { error: livestockError } = await supabase.from('livestock').insert(livestock);
  if (livestockError) {
    console.error('❌ Livestock error:', livestockError);
  } else {
    console.log(`✅ ${livestock.length} livestock entries added`);
  }

  console.log('\n🎉 Apple Review account setup complete!');
  console.log('\n📋 Credentials for App Store Connect:');
  console.log('Email: applereview@aquaxone.app');
  console.log('Password: AppleReview2026!');
  console.log('Tier: Super Premium (active until 2027-12-31)');
})();
