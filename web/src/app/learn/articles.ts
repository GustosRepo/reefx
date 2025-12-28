// Article content data for the learn section

export interface Article {
  slug: string;
  title: string;
  description: string;
  icon: string;
  readTime: string;
  category: string;
  publishedAt: string;
  author: string;
  content: string;
}

export const articles: Record<string, Article> = {
  "beginners-guide-reef-keeping": {
    slug: "beginners-guide-reef-keeping",
    title: "Beginner's Guide to Reef Keeping",
    description: "Everything you need to know to start your first saltwater reef aquarium. From tank selection to your first coral.",
    icon: "🐠",
    readTime: "8 min read",
    category: "Getting Started",
    publishedAt: "2024-01-15",
    author: "REEFXONE Team",
    content: `
# Beginner's Guide to Reef Keeping

Starting a reef aquarium is one of the most rewarding hobbies you can pursue. The combination of colorful fish, vibrant corals, and the challenge of maintaining a mini-ecosystem makes it endlessly fascinating. This guide will walk you through everything you need to know to get started.

## Why Keep a Reef Tank?

Reef aquariums bring a piece of the ocean into your home. Beyond their stunning beauty, they offer:

- **Stress relief** - Watching fish and corals has proven calming effects
- **Educational value** - Learn about marine biology and chemistry
- **Creative expression** - Design your own underwater landscape
- **Community** - Join a passionate global community of reef keepers

## Choosing Your Tank Size

One of the most common pieces of advice is "go as big as you can afford." Larger tanks are actually easier to maintain because:

- Water parameters are more stable
- More room for error
- Better fish selection options
- Easier to create natural-looking aquascapes

**Recommended starter sizes:**
- 40 gallons - Good balance of size and manageability
- 75 gallons - Excellent for beginners with space
- 20 gallons - Possible but requires more attention

## Essential Equipment

### Filtration
Your filtration system is the heart of your reef tank. Most modern reef keepers use a **sump-based system** which includes:

- **Protein skimmer** - Removes organic waste before it breaks down
- **Return pump** - Circulates water back to the display tank
- **Filter socks or roller mat** - Mechanical filtration

### Lighting
Corals need light to survive. LED lighting has become the standard due to:

- Energy efficiency
- Programmable schedules
- Long lifespan
- Spectrum control

Popular options include AI Hydra, Ecotech Radion, and Red Sea ReefLED.

### Flow
Water movement is crucial for coral health. Aim for:

- 20-40x tank turnover for mixed reef
- Variable flow patterns
- Elimination of dead spots

### Heating
Maintain stable temperature between 76-80°F (24-27°C) with:

- Quality heater rated for your tank size
- Consider redundant heaters for safety
- Use a controller for precise regulation

## The Nitrogen Cycle

Before adding any livestock, your tank must complete the **nitrogen cycle**:

1. **Ammonia** - From fish waste and decaying matter (toxic)
2. **Nitrite** - Bacteria convert ammonia to nitrite (still toxic)
3. **Nitrate** - Bacteria convert nitrite to nitrate (less toxic)

This process typically takes 4-6 weeks. Test your water regularly and don't rush it!

## Starting with Hardy Species

Once your tank is cycled, start with forgiving species:

**Hardy Fish:**
- Clownfish (Amphiprion ocellaris)
- Royal Gramma
- Firefish
- Cardinalfish

**Beginner Corals:**
- Zoanthids
- Mushroom corals
- Green Star Polyps
- Kenya Tree

## Daily & Weekly Tasks

**Daily:**
- Feed fish (small amounts, 1-2 times)
- Check temperature
- Observe livestock for health issues
- Top off evaporated water

**Weekly:**
- Test water parameters (alkalinity, calcium, pH, salinity)
- Clean glass
- Empty protein skimmer collection cup
- 10-15% water change

## Common Mistakes to Avoid

1. **Rushing the cycle** - Patience is essential
2. **Overstocking** - Less is more, especially starting out
3. **Overfeeding** - Leads to poor water quality
4. **Chasing parameters** - Make small, gradual adjustments
5. **Neglecting maintenance** - Consistency is key

## Your First Year Timeline

**Month 1-2:** Cycle the tank, add cleanup crew
**Month 3-4:** Add first fish and beginner corals
**Month 6:** Evaluate and add more livestock slowly
**Month 12:** Consider more challenging species

## Tracking Your Progress

Keeping detailed records of your water parameters helps you:

- Spot trends before they become problems
- Learn what works for your specific tank
- Share data with other reefers for advice

**That's exactly why we built REEFXONE** - to make parameter tracking effortless and give you insights into your reef's health.

## Conclusion

Reef keeping is a marathon, not a sprint. Take your time, do your research, and don't be afraid to ask for help from the community. Every successful reefer was once a beginner!

Ready to start tracking your reef? [Create your free REEFXONE account](/register) and join thousands of reef keepers monitoring their tanks with us.
    `
  },

  "understanding-water-parameters": {
    slug: "understanding-water-parameters",
    title: "Understanding Water Parameters",
    description: "Learn why water chemistry matters and how each parameter affects your reef's health.",
    icon: "🧪",
    readTime: "10 min read",
    category: "Water Chemistry",
    publishedAt: "2024-01-20",
    author: "REEFXONE Team",
    content: `
# Understanding Water Parameters

Water chemistry is the foundation of a successful reef aquarium. Understanding what each parameter means and how they interact will help you maintain a stable, thriving environment for your corals and fish.

## Why Parameters Matter

Your reef tank is a closed ecosystem. In the ocean, water volume and natural processes keep parameters stable. In your tank, you must manage this delicate balance. Unstable or incorrect parameters lead to:

- Coral stress and bleaching
- Disease susceptibility in fish
- Algae outbreaks
- Slow or stunted growth

## The Core Parameters

### Temperature

**Ideal Range:** 76-80°F (24-27°C)

Temperature affects metabolic rates of all your livestock. Consistency is more important than hitting an exact number.

**Tips:**
- Use a quality digital thermometer
- Consider a controller with heater/chiller management
- Watch for temperature swings during water changes

### Salinity

**Ideal Range:** 1.024-1.026 specific gravity (32-35 ppt)

Salinity measures dissolved salt content. Fish and corals are adapted to specific salinity ranges.

**Tips:**
- Use a refractometer for accurate readings
- Calibrate regularly with calibration fluid
- Account for evaporation (top off with fresh RO/DI water)

### pH

**Ideal Range:** 8.0-8.4

pH measures acidity/alkalinity. Most reef organisms thrive in slightly alkaline conditions.

**Tips:**
- Test at the same time each day (pH fluctuates naturally)
- Low pH often indicates poor gas exchange
- Increase surface agitation if pH is low

### Alkalinity (dKH)

**Ideal Range:** 7-11 dKH

Alkalinity is your tank's pH buffer and provides carbonate for coral skeletons. This is the most important parameter for coral growth.

**Tips:**
- Test 2-3 times per week minimum
- Dose slowly and consistently
- Avoid swings greater than 1 dKH per day

### Calcium

**Ideal Range:** 380-450 ppm

Calcium is a building block for coral skeletons and shells. Works hand-in-hand with alkalinity.

**Tips:**
- Maintain proper calcium-to-alkalinity ratio
- Heavy SPS tanks consume calcium rapidly
- Consider a calcium reactor for demanding systems

### Magnesium

**Ideal Range:** 1250-1450 ppm

Magnesium enables corals to properly utilize calcium and alkalinity. Often called the "forgotten" parameter.

**Tips:**
- Test monthly at minimum
- Low magnesium = difficulty maintaining alk/calcium
- Raise slowly using magnesium supplements

### Phosphate (PO4)

**Ideal Range:** 0.03-0.1 ppm

Phosphate is a nutrient that can fuel nuisance algae if too high, but is essential for coral tissue growth.

**Tips:**
- Ultra-low phosphate can actually harm corals
- Use phosphate removers carefully
- Balance with nitrate for best coral color

### Nitrate (NO3)

**Ideal Range:** 5-20 ppm

Nitrate is the end product of the nitrogen cycle. Some is necessary for coral health.

**Tips:**
- Zero nitrate is not the goal for most systems
- High nitrate usually means overfeeding
- Carbon dosing can reduce nitrate

## Testing Frequency

| Parameter | Frequency |
|-----------|-----------|
| Temperature | Daily |
| Salinity | Weekly |
| pH | Weekly |
| Alkalinity | 2-3x per week |
| Calcium | Weekly |
| Magnesium | Monthly |
| Phosphate | Weekly |
| Nitrate | Weekly |

## The Importance of Stability

Wild swings in parameters are more harmful than slightly out-of-range stable values. When making corrections:

- Make small adjustments (no more than 10% change per day)
- Test before and after dosing
- Keep detailed logs to spot trends

## Tracking Your Parameters

Manually logging parameters in a notebook works, but digital tracking offers:

- Trend visualization over time
- Alerts when parameters drift
- Historical data for troubleshooting
- Easy sharing with other reefers

REEFXONE makes parameter tracking simple with automatic charts, trend analysis, and customizable alerts.

## Conclusion

Understanding water parameters takes time, but it's the key to reef keeping success. Start with the basics, test regularly, and always prioritize stability over perfection.

[Start tracking your parameters free with REEFXONE →](/register)
    `
  },

  "ideal-alkalinity-levels": {
    slug: "ideal-alkalinity-levels",
    title: "Maintaining Ideal Alkalinity Levels",
    description: "A deep dive into alkalinity - why it's crucial for coral growth and how to keep it stable.",
    icon: "⚗️",
    readTime: "6 min read",
    category: "Water Chemistry",
    publishedAt: "2024-02-01",
    author: "REEFXONE Team",
    content: `
# Maintaining Ideal Alkalinity Levels

If there's one parameter that experienced reef keepers obsess over, it's alkalinity. Understanding and maintaining proper alkalinity is essential for coral health and growth.

## What is Alkalinity?

Alkalinity (also called carbonate hardness or KH) measures your water's capacity to buffer pH changes. It represents the concentration of carbonate (CO3) and bicarbonate (HCO3) ions in your water.

For corals, alkalinity serves a dual purpose:
1. **pH Buffer** - Prevents dangerous pH swings
2. **Building Material** - Provides carbonate for coral skeleton construction

## Ideal Alkalinity Ranges

**General Range:** 7-11 dKH

Different systems thrive at different levels:

| Tank Type | Recommended dKH |
|-----------|-----------------|
| Fish Only | 7-8 dKH |
| Soft Coral | 7-9 dKH |
| LPS Dominant | 8-10 dKH |
| SPS Dominant | 7-9 dKH |
| Mixed Reef | 8-9 dKH |

**Pro Tip:** Natural seawater is approximately 7 dKH. Many successful SPS keepers target this level.

## Signs of Alkalinity Problems

### Too Low (< 7 dKH)
- Slow or no coral growth
- pH instability
- Coral tissue recession
- STN (Slow Tissue Necrosis)

### Too High (> 12 dKH)
- Coral tissue damage
- Burnt tips on SPS
- White tips or tissue loss
- Precipitation issues

## What Consumes Alkalinity?

Alkalinity doesn't just disappear - it's actively used:

1. **Coral calcification** - The primary consumer
2. **Coralline algae growth** - Often overlooked
3. **Other calcifiers** - Snails, clams, tube worms
4. **Chemical reactions** - With calcium in the water

A mature SPS tank can consume 1-2 dKH per day or more!

## Methods to Maintain Alkalinity

### 1. Two-Part Dosing
Most popular for beginners. Involves dosing equal parts:
- Part A: Alkalinity (sodium bicarbonate/carbonate)
- Part B: Calcium (calcium chloride)

**Pros:** Simple, inexpensive, precise control
**Cons:** Daily dosing required, sodium buildup over time

### 2. Kalkwasser (Limewater)
Calcium hydroxide mixed with top-off water.

**Pros:** Replenishes calcium and alk together, raises pH
**Cons:** Requires careful implementation, can spike pH

### 3. Calcium Reactor
Uses CO2 to dissolve calcium carbonate media.

**Pros:** Automated, balanced dosing, handles high demand
**Cons:** Higher upfront cost, requires monitoring

### 4. All-in-One Solutions
Commercial products like Tropic Marin All-For-Reef.

**Pros:** Simple, includes trace elements
**Cons:** More expensive long-term

## Dosing Best Practices

1. **Test first, dose second** - Know your consumption rate
2. **Dose when lights are off** - Better stability
3. **Space out doses** - Never dump large amounts at once
4. **Use dosing pumps** - Automation prevents forgetting

## Calculating Your Dose

To raise alkalinity 1 dKH in a 100-gallon system, you need approximately:
- 15g sodium bicarbonate (baking soda)
- Or 10g sodium carbonate (soda ash)

Always use a reliable calculator or start with manufacturer recommendations.

## Stability is Everything

The #1 rule of alkalinity: **Consistency beats perfection.**

A tank stable at 7.5 dKH will outperform a tank swinging between 8-10 dKH. Corals can adapt to a range of values, but they cannot adapt to instability.

**Safe adjustment rate:** No more than 1 dKH per day

## Tracking Alkalinity

Because alkalinity changes quickly, regular testing is essential:

- **High-demand tanks:** Test daily
- **Moderate tanks:** Test every 2-3 days
- **Established tanks:** Test weekly minimum

With REEFXONE, you can log your alkalinity readings and instantly see trends. Catch consumption rate changes before they become problems.

## Conclusion

Alkalinity is the lifeblood of a coral reef tank. Master this parameter, and you're well on your way to reef keeping success. Remember: test often, dose consistently, and always prioritize stability.

[Track your alkalinity trends with REEFXONE →](/register)
    `
  },

  "temperature-salinity-guide": {
    slug: "temperature-salinity-guide",
    title: "Temperature & Salinity: The Basics",
    description: "Master the fundamentals of maintaining proper temperature and salinity in your reef tank.",
    icon: "🌡️",
    readTime: "5 min read",
    category: "Water Chemistry",
    publishedAt: "2024-02-10",
    author: "REEFXONE Team",
    content: `
# Temperature & Salinity: The Basics

Temperature and salinity are the two most fundamental parameters in reef keeping. Get these right, and you've built a solid foundation for your tank.

## Temperature

### Ideal Range: 76-80°F (24-27°C)

Most reef organisms originate from tropical waters with remarkably stable temperatures. Your goal is to replicate this stability.

### Why Temperature Matters

- **Metabolic rates** - Higher temps = faster metabolism
- **Oxygen levels** - Warmer water holds less oxygen
- **Disease resistance** - Stress from temperature swings weakens immunity
- **Coral bleaching** - Prolonged high temps cause coral stress

### Finding Your Target

Many reefers aim for 78°F as a safe middle ground. However, consider:

- **Lower (76-77°F):** Slower metabolism, potentially better disease resistance
- **Higher (79-80°F):** Faster growth, higher oxygen demand

### Equipment Recommendations

**Heaters:**
- Use titanium or quality glass heaters
- Size: 3-5 watts per gallon
- Consider dual heaters for redundancy

**Controllers:**
- Apex, GHL, or similar for precise control
- Set alarms for temperature deviations
- Automate heater/chiller control

### Avoiding Temperature Swings

- Keep tank away from windows and AC vents
- Use a chiller or fans in summer
- Float new water during water changes to match temp
- Never exceed 1-2°F change per hour

## Salinity

### Ideal Range: 1.024-1.026 SG (32-35 ppt)

Salinity measures the dissolved salt content in your water. This directly affects the osmoregulation of every organism in your tank.

### Why Salinity Matters

- **Osmoregulation** - Fish and corals regulate internal fluids based on external salinity
- **Coral function** - Affects photosynthesis and calcification rates
- **Invertebrate health** - Snails, shrimp, and crabs are very sensitive
- **Oxygen carrying capacity** - Higher salinity = less dissolved oxygen

### Measuring Salinity

**Refractometer** (Recommended)
- Most accurate for home use
- Requires calibration with 35ppt solution
- Temperature compensated models preferred

**Digital Salinity Meter**
- Expensive but very accurate
- Hanna, Milwaukee brands popular
- Requires periodic calibration

**Hydrometer** (Not Recommended)
- Cheap but inaccurate
- Air bubbles cause false readings
- Fine for fish-only, not for reefs

### Managing Salinity

**Evaporation**
- Only water evaporates, salt stays behind
- Top off with fresh RO/DI water only
- Auto top-off (ATO) systems maintain stability

**Water Changes**
- Mix saltwater to match tank salinity
- Use RO/DI water for mixing
- Let saltwater mix for 24 hours before use

### Common Mistakes

1. **Topping off with saltwater** - Raises salinity dangerously
2. **Not calibrating refractometer** - Leads to inaccurate readings
3. **Large salinity swings** - More than 0.002 SG change per day
4. **Ignoring evaporation** - Can concentrate salt quickly

## Matching Natural Conditions

Natural reef water parameters:
- Temperature: 77-84°F (varies by location)
- Salinity: 35 ppt (1.026 SG)

Most successful reef keepers aim for 1.025-1.026 SG and 77-79°F.

## Stability Tips

1. **Invest in quality equipment** - Cheap heaters fail
2. **Use controllers** - Automation prevents disasters  
3. **Monitor daily** - Quick glance at temp/salinity
4. **Keep a log** - Track trends over time

## Conclusion

Temperature and salinity are your tank's vital signs. Check them daily, maintain stability, and your livestock will thrive. These two parameters alone can make or break your reef.

[Start logging your temperature and salinity with REEFXONE →](/register)
    `
  },

  "common-reef-keeping-mistakes": {
    slug: "common-reef-keeping-mistakes",
    title: "10 Common Reef Keeping Mistakes",
    description: "Avoid these pitfalls that trip up beginners and even experienced reefers.",
    icon: "⚠️",
    readTime: "7 min read",
    category: "Tips & Tricks",
    publishedAt: "2024-02-15",
    author: "REEFXONE Team",
    content: `
# 10 Common Reef Keeping Mistakes

Every reef keeper makes mistakes - it's part of the learning process. But some mistakes are more costly than others. Here are the top 10 pitfalls and how to avoid them.

## 1. Rushing the Cycle

**The Mistake:** Adding fish before the tank is fully cycled.

**Why It Happens:** Excitement and impatience. New tank syndrome is real!

**The Solution:**
- Wait for ammonia AND nitrite to read zero
- Cycle typically takes 4-8 weeks
- Test regularly and document results
- Consider using established media or bottled bacteria

**Remember:** No fish is worth losing to an uncycled tank.

## 2. Overstocking Too Fast

**The Mistake:** Adding too many fish or corals at once.

**Why It Happens:** Everything at the store looks amazing.

**The Solution:**
- One fish at a time, minimum 2 weeks apart
- Quarantine new additions
- Research compatibility before buying
- Let your tank mature before demanding species

## 3. Overfeeding

**The Mistake:** Feeding too much or too often.

**Why It Happens:** Fish always look hungry. They're begging!

**The Solution:**
- Feed only what's consumed in 1-2 minutes
- Once or twice daily is sufficient
- Use a feeding schedule
- Vary diet (frozen, pellet, flake)

**Signs of overfeeding:** Rising nitrate/phosphate, nuisance algae, cloudy water.

## 4. Chasing Numbers

**The Mistake:** Making drastic adjustments to hit "perfect" parameters.

**Why It Happens:** Reading forums about ideal numbers.

**The Solution:**
- Prioritize stability over exact values
- Make small changes (max 10% per day)
- Let the tank adjust between changes
- Focus on trends, not single readings

## 5. Neglecting Maintenance

**The Mistake:** Skipping water changes and routine tasks.

**Why It Happens:** Life gets busy. Tank looks fine.

**The Solution:**
- Set a weekly schedule and stick to it
- 10-15% weekly water changes
- Clean equipment regularly
- Don't wait for problems to appear

## 6. Buying Cheap Equipment

**The Mistake:** Cutting corners on critical equipment.

**Why It Happens:** Reef keeping is expensive. Budget is real.

**The Solution:**
- Invest in quality heaters, skimmers, and lights
- Cheap equipment fails when you need it most
- Buy once, cry once
- Save money on decorations, not life support

**Worth investing in:** Heater, return pump, skimmer, test kits, lighting.

## 7. Ignoring Quarantine

**The Mistake:** Adding fish or corals directly to the display tank.

**Why It Happens:** Seems like extra work. Fish looked healthy at the store.

**The Solution:**
- Set up a simple quarantine tank
- Observe new fish for 4+ weeks
- Coral dips for new frags
- One sick fish can wipe out your tank

## 8. Poor Research

**The Mistake:** Buying livestock without understanding their needs.

**Why It Happens:** Impulse buying. That fish was SO cool.

**The Solution:**
- Research BEFORE you go to the store
- Understand: size, temperament, diet, tank requirements
- Check compatibility with existing livestock
- Ask questions - reputable stores will help

## 9. Trusting One Source

**The Mistake:** Believing everything one person or website says.

**Why It Happens:** Information overload. Just want a simple answer.

**The Solution:**
- Cross-reference information
- Join multiple forums and communities
- Understand that "it depends" is often the real answer
- Learn the principles, not just the rules

## 10. Not Testing Regularly

**The Mistake:** Only testing when something goes wrong.

**Why It Happens:** Tank looks fine. Tests are a hassle.

**The Solution:**
- Establish a testing routine
- Track results to spot trends
- Invest in quality test kits
- Use a tracker app (like REEFXONE!) to visualize data

## Bonus: Analysis Paralysis

Getting so overwhelmed by information that you never take action. Remember:

- Start simple and learn as you go
- Mistakes are part of the journey
- The reef keeping community is helpful
- Every expert was once a beginner

## Conclusion

Mistakes happen, but they don't have to be catastrophic. Learn from others' experiences, take your time, and remember that reef keeping is a marathon, not a sprint.

[Track your progress and avoid mistakes with REEFXONE →](/register)
    `
  },

  "essential-reef-equipment": {
    slug: "essential-reef-equipment",
    title: "Essential Reef Tank Equipment",
    description: "A complete guide to the equipment you need for a successful reef aquarium.",
    icon: "🔧",
    readTime: "9 min read",
    category: "Equipment",
    publishedAt: "2024-02-20",
    author: "REEFXONE Team",
    content: `
# Essential Reef Tank Equipment

Building a reef tank requires more than just a glass box and some saltwater. This guide covers all the essential equipment you need, from absolute necessities to nice-to-haves.

## The Tank & Stand

### Display Tank
- **Glass vs Acrylic:** Glass scratches less, acrylic is lighter and stronger
- **Rimless:** Modern look, requires careful water level management
- **Drilled vs HOB:** Drilled tanks with sumps are preferred for reefs
- **Size:** Bigger is generally better for stability

### Stand
- Must support 10+ lbs per gallon of water
- Waterproof or water-resistant materials
- Space for sump and equipment
- Level surface is critical

## Filtration System

### Sump
The sump is the heart of your filtration. Benefits include:
- Houses equipment out of sight
- Increases water volume
- Provides space for refugium
- Easy access for maintenance

### Protein Skimmer
Removes organic waste before it breaks down. Essential for any reef.

**Sizing:** 2-3x your tank volume for best results
**Types:** In-sump, hang-on-back, external
**Popular brands:** Reef Octopus, Nyos, Bubble Magus

### Filter Media
- **Carbon:** Removes yellowing compounds and toxins
- **GFO:** Phosphate removal
- **Filter socks/roller mat:** Mechanical filtration

## Water Movement

### Return Pump
Moves water from sump to display.
- **DC pumps:** Adjustable, quiet, controllable
- **AC pumps:** Reliable, powerful, less expensive
- **Size:** 5-10x tank volume turnover per hour

### Powerheads/Wave Makers
Create flow for coral health.
- **Target:** 20-40x tank volume turnover
- **Placement:** Create varied, random flow
- **Popular brands:** Ecotech VorTech, Maxspect, Tunze

## Lighting

Modern reef lighting is dominated by LEDs.

### Key Features to Look For
- Full spectrum with UV and violet
- Programmable sunrise/sunset
- Adjustable intensity
- Spread pattern for your tank size

### Popular Options
| Budget | Mid-Range | High-End |
|--------|-----------|----------|
| Viparspectra | AI Prime | AI Hydra |
| Hipargero | Kessil A80 | Kessil A500 |
| NICREW | Red Sea ReefLED | Ecotech Radion |

### PAR Levels
- Soft corals: 50-150 PAR
- LPS corals: 100-200 PAR
- SPS corals: 200-400+ PAR

## Heating & Cooling

### Heaters
- **Wattage:** 3-5 watts per gallon
- **Redundancy:** Use 2 smaller heaters
- **Placement:** Near flow for even distribution
- **Quality matters:** Cheap heaters fail

### Chillers (if needed)
- Required in warm climates
- Size based on tank volume and ambient temp
- Expensive but necessary in some regions
- Consider fans as budget alternative

## Testing Equipment

### Essential Tests
- Salinity (refractometer)
- Temperature (digital thermometer)
- Ammonia, Nitrite, Nitrate
- pH, Alkalinity, Calcium, Magnesium
- Phosphate

### Test Kit Recommendations
| Type | Budget | Recommended |
|------|--------|-------------|
| All-in-one | API | Red Sea, Salifert |
| Alk/Cal/Mag | - | Hanna Checkers |
| Refractometer | Generic | Milwaukee |

## Automation

### Auto Top-Off (ATO)
Automatically replaces evaporated water.
- Prevents salinity swings
- Essential for stability
- Budget to premium options available

### Controllers
The brain of your system.
- Monitors all parameters
- Controls equipment
- Sends alerts
- Popular: Neptune Apex, GHL Profilux

### Dosing Pumps
Automatically dose supplements.
- Two-part (alk/calcium)
- Trace elements
- Saves time and increases consistency

## Water Preparation

### RO/DI System
Produces pure water for mixing and top-off.
- Removes chlorine, chloramine, TDS
- Essential for success
- 4-7 stage systems recommended
- Monitor TDS and replace filters

### Mixing Station
- Dedicated container for saltwater
- Heater and pump for mixing
- Mix 24-48 hours before use
- Store ready-to-use saltwater

## Nice-to-Haves

### Quarantine Tank
- 10-20 gallons is sufficient
- Separate heater and filter
- PVC fittings for hiding spots
- Saves your display tank from disease

### Refugium Lighting
- Grows chaetomorpha or caulerpa
- Natural nutrient export
- Increases pod population

### Backup Power
- Battery backup for return pump
- Generator for extended outages
- Air pump as minimum backup

## Equipment Priority Order

If building on a budget, prioritize in this order:

1. Quality tank and stand
2. Heater (reliable brand)
3. Lighting (appropriate for your corals)
4. Circulation (return pump + powerheads)
5. Protein skimmer
6. ATO system
7. Test kits
8. Controller

## Tracking Your Equipment

Keep records of:
- Purchase dates
- Warranty information
- Maintenance schedules
- Replacement parts

REEFXONE's equipment tracking feature helps you stay organized and never miss a filter change or warranty expiration.

## Conclusion

The right equipment makes reef keeping manageable and enjoyable. Invest wisely in quality gear, and your tank will reward you with years of success.

[Track your equipment with REEFXONE →](/register)
    `
  },

  "coral-care-basics": {
    slug: "coral-care-basics",
    title: "Coral Care Basics for Beginners",
    description: "Learn how to select, place, and care for your first corals with confidence.",
    icon: "🪸",
    readTime: "8 min read",
    category: "Coral Care",
    publishedAt: "2024-02-25",
    author: "REEFXONE Team",
    content: `
# Coral Care Basics for Beginners

Adding corals transforms your fish tank into a true reef aquarium. This guide covers everything beginners need to know about selecting and caring for their first corals.

## Understanding Coral Types

### Soft Corals
**Difficulty:** Beginner

Soft corals lack a hard calcium skeleton. They're forgiving and great for beginners.

**Examples:**
- Leather corals (Sinularia, Sarcophyton)
- Mushrooms (Discosoma, Rhodactis)
- Zoanthids and Palythoa
- Kenya Tree
- Xenia
- Green Star Polyps

**Requirements:**
- Low to moderate light
- Low to moderate flow
- Stable parameters (not perfect)

### LPS (Large Polyp Stony)
**Difficulty:** Beginner to Intermediate

LPS have large fleshy polyps over a calcium skeleton.

**Examples:**
- Hammer coral (Euphyllia ancora)
- Torch coral (Euphyllia glabrescens)
- Frogspawn (Euphyllia divisa)
- Candy Cane (Caulastrea)
- Duncan coral
- Acan Lords

**Requirements:**
- Moderate light
- Low to moderate flow
- Stable alkalinity and calcium
- Feeding beneficial

### SPS (Small Polyp Stony)
**Difficulty:** Advanced

SPS are the pinnacle of reef keeping with small polyps and intricate skeletons.

**Examples:**
- Acropora (staghorn, table)
- Montipora (caps, digitata)
- Stylophora
- Pocillopora
- Seriatopora (Bird's Nest)

**Requirements:**
- High light (200-400+ PAR)
- High, varied flow
- Pristine water quality
- Very stable alk/cal/mag

## Selecting Your First Corals

### Good Starter Corals

1. **Zoanthids** - Hardy, colorful, fast-growing
2. **Mushrooms** - Nearly indestructible
3. **Green Star Polyps** - Grows like a weed
4. **Kenya Tree** - Drops frags everywhere
5. **Toadstool Leather** - Impressive and forgiving
6. **Duncan** - LPS that's beginner-friendly
7. **Candy Cane** - Hardy LPS with great colors

### What to Avoid First

- Most SPS (especially Acropora)
- Goniopora (flower pot)
- Elegance coral
- Non-photosynthetic corals
- Anemones (technically not coral, but common question)

## Acclimation

Proper acclimation reduces stress and improves survival.

### Steps:
1. **Float the bag** - 15-20 minutes to equalize temperature
2. **Dim the lights** - Reduce stress
3. **Drip acclimate** - Match salinity and pH over 30-60 minutes
4. **Dip the coral** - Use a coral dip to kill pests
5. **Place in tank** - Start in lower light area

### Coral Dipping

Essential to prevent introducing pests:
- Coral RX, Bayer, or Two Little Fishies Revive
- Follow product instructions
- Inspect coral during dip
- Shake to dislodge pests

## Placement

### Light Considerations
- Start lower, move up gradually
- Light shock causes bleaching
- Use a PAR meter if possible
- Observe coral response over weeks

### Flow Considerations
- Most corals like indirect flow
- Avoid blasting directly
- Polyps should sway, not flatten
- SPS need more flow than soft corals

### Spacing
- Leave room for growth
- Consider aggression (sweeper tentacles)
- Euphyllia need 6+ inches from neighbors
- Some corals are toxic to others

## Feeding

### Do Corals Need Feeding?

Corals get nutrition from:
1. **Photosynthesis** - Zooxanthellae provide most energy
2. **Dissolved organics** - From fish waste
3. **Particulate feeding** - Catching food particles
4. **Target feeding** - You providing food

### What to Feed
- Reef Roids
- Oyster feast
- Coral frenzy
- Mysis shrimp (for LPS)
- Amino acids

### Feeding Tips
- Target feed LPS weekly
- Broadcast feed for soft corals
- Feed after lights out (polyps extended)
- Don't overfeed - water quality matters

## Signs of Healthy Corals

- Full polyp extension
- Vibrant coloration
- Visible growth
- No tissue recession
- No pests visible

## Signs of Stress

- Polyps retracted
- Color loss (bleaching)
- Tissue recession
- Brown coloration (browning out)
- Mucus production
- Not opening

## Common Problems

### Bleaching
Loss of zooxanthellae due to stress.

**Causes:** Light shock, temperature stress, chemical exposure
**Solution:** Address the stressor, provide stable conditions

### Brown Jelly Disease
Bacterial infection appearing as brown mucus.

**Treatment:** Remove affected coral, frag healthy tissue, dip

### Tissue Recession
Tissue dying from base upward.

**Causes:** Poor water quality, alk swings, aggression
**Solution:** Stabilize parameters, check placement

## Growth Timeline

Don't expect instant results:

| Coral Type | Growth Rate |
|------------|-------------|
| Zoanthids | 1 polyp/week typical |
| GSP | Fast, can cover rock |
| Mushrooms | Monthly splitting |
| LPS | Slow, new heads yearly |
| SPS | Variable, inches per year |

## Tracking Your Corals

Record keeping helps you:
- Track growth over time
- Remember frag sources
- Note placement and conditions
- Learn what works for your tank

REEFXONE's gallery feature lets you photograph and track your corals' progress over time.

## Conclusion

Start with forgiving species, provide stable conditions, and be patient. Every thriving reef tank started with a single coral. Soon you'll be fragging and sharing with fellow reefers!

[Start your coral journey with REEFXONE →](/register)
    `
  },

  "testing-water-best-practices": {
    slug: "testing-water-best-practices",
    title: "Water Testing Best Practices",
    description: "How often to test, which test kits to use, and how to interpret your results.",
    icon: "📊",
    readTime: "6 min read",
    category: "Water Chemistry",
    publishedAt: "2024-03-01",
    author: "REEFXONE Team",
    content: `
# Water Testing Best Practices

Regular water testing is the foundation of successful reef keeping. This guide covers everything from choosing test kits to interpreting your results.

## Why Test Your Water?

Testing allows you to:
- **Catch problems early** - Before they become visible
- **Understand consumption** - Know how fast your tank uses elements
- **Optimize dosing** - Neither under nor over-supplement
- **Track trends** - See patterns over time
- **Troubleshoot issues** - Data helps diagnose problems

## Which Parameters to Test

### Critical (Test Weekly or More)
| Parameter | Target | Frequency |
|-----------|--------|-----------|
| Salinity | 1.024-1.026 | Daily check |
| Temperature | 76-80°F | Daily check |
| Alkalinity | 7-11 dKH | 2-3x/week |
| Calcium | 380-450 ppm | Weekly |
| Phosphate | 0.03-0.1 ppm | Weekly |
| Nitrate | 5-20 ppm | Weekly |

### Important (Test Regularly)
| Parameter | Target | Frequency |
|-----------|--------|-----------|
| Magnesium | 1250-1450 ppm | Monthly |
| pH | 8.0-8.4 | Weekly |
| Ammonia | 0 | When issues arise |
| Nitrite | 0 | When issues arise |

### Advanced (ICP Testing)
For comprehensive analysis, consider ICP testing every 3-6 months:
- All major and minor elements
- Heavy metal detection
- Identifies contamination

## Choosing Test Kits

### Budget Options
**API Saltwater Master Kit**
- Good for cycling
- Less accurate for reef parameters
- Fine for fish-only tanks

### Recommended for Reef Tanks

**Alkalinity:**
- Hanna Checker HI772 (most accurate)
- Salifert
- Red Sea

**Calcium:**
- Hanna Checker HI758
- Salifert
- Red Sea

**Magnesium:**
- Salifert
- Red Sea

**Nitrate:**
- Hanna Checker HI781
- Salifert
- Red Sea

**Phosphate:**
- Hanna Checker HI736 (ULR) or HI713
- Red Sea

### Digital vs Colorimetric

| Type | Pros | Cons |
|------|------|------|
| Digital (Hanna) | Accurate, repeatable | Expensive, need reagents |
| Colorimetric | Affordable, available | Color matching subjective |

## Testing Best Practices

### Consistency Matters
- Test at the same time of day
- Use same procedures each time
- Store reagents properly
- Replace expired reagents

### Proper Technique
1. Clean test vials thoroughly
2. Use distilled water to rinse
3. Follow instructions exactly
4. Wait the full development time
5. Read results at eye level

### Common Mistakes
- Not shaking reagent bottles
- Using expired reagents
- Rushing development time
- Poor lighting when reading colors
- Contaminated test vials

## Interpreting Results

### What's "Normal"?

There's no single "correct" value. Focus on:
- **Your tank's stable point** - Where things thrive
- **Trends** - Rising or falling over time
- **Consumption rate** - How fast parameters change

### When to Be Concerned

**Alkalinity swings**
- More than 1 dKH change in 24 hours
- Consistent drop without dosing adjustment

**Nitrate/Phosphate**
- Nitrate above 40 ppm
- Phosphate above 0.2 ppm
- Ratio imbalance (causing ugly corals)

**Calcium/Magnesium**
- Calcium difficult to raise (check magnesium first)
- Calcium precipitation

## Tracking Your Results

Paper logs work, but digital tracking offers:

✅ **Trend visualization** - See changes over weeks/months
✅ **Correlations** - Connect parameters to events
✅ **Shareable data** - Get help from community
✅ **Historical reference** - What worked before?
✅ **Consumption calculations** - Know your dosing needs

### Why REEFXONE?

REEFXONE makes water testing more useful:
- Log results in seconds
- Automatic trend charts
- Compare multiple parameters
- Track across multiple tanks
- Access from any device

## Testing Schedule Template

### Daily
- Quick visual check
- Temperature verification
- Salinity verification

### Every 2-3 Days
- Alkalinity

### Weekly
- Alkalinity
- Calcium
- Nitrate
- Phosphate
- pH

### Monthly
- Magnesium
- All above parameters

### Quarterly
- ICP test
- Equipment calibration check

## When Things Go Wrong

If you get concerning results:

1. **Don't panic** - Retest to confirm
2. **Cross-reference** - Use a second test kit if available
3. **Check calibration** - Are your tools accurate?
4. **Make gradual changes** - No drastic corrections
5. **Document everything** - Track what you do

## Conclusion

Testing isn't just about numbers - it's about understanding your unique reef ecosystem. Regular, consistent testing combined with good record-keeping is the key to long-term success.

[Start tracking your test results with REEFXONE →](/register)
    `
  }
};

export function getArticle(slug: string): Article | undefined {
  return articles[slug];
}

export function getAllArticles(): Article[] {
  return Object.values(articles);
}
