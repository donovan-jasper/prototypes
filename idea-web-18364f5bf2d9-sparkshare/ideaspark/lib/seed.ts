import { getDatabase } from './database';

const sampleIdeas = [
  { title: 'AI-Powered Meal Planner', description: 'An app that generates weekly meal plans based on dietary preferences, budget, and available ingredients. Uses AI to suggest recipes and auto-generates shopping lists.', category: 'tech' },
  { title: 'Local Coffee Subscription Box', description: 'Monthly subscription delivering freshly roasted beans from local roasters. Each box includes tasting notes and brewing tips. Support small businesses while discovering new flavors.', category: 'food' },
  { title: 'On-Demand Pet Sitting Network', description: 'Connect pet owners with verified sitters in their neighborhood. Real-time GPS tracking, photo updates, and instant booking. Like Uber for pet care.', category: 'service' },
  { title: 'Modular Standing Desk', description: 'Affordable standing desk with swappable components. Add monitor arms, cable management, or storage modules as needed. Flat-pack design for easy shipping.', category: 'product' },
  { title: 'Voice-Controlled Smart Garden', description: 'Indoor hydroponic system with voice assistant integration. Monitors water, nutrients, and light automatically. Grow herbs and vegetables year-round with zero effort.', category: 'tech' },
  { title: 'Ghost Kitchen for Healthy Bowls', description: 'Delivery-only restaurant specializing in customizable grain bowls. Partner with gyms and offices for corporate lunch programs. Low overhead, high margins.', category: 'food' },
  { title: 'Senior Tech Support Service', description: 'In-home tech help for elderly people. Set up devices, teach video calls, troubleshoot issues. Monthly subscription model with 24/7 phone support.', category: 'service' },
  { title: 'Collapsible Camping Cookware', description: 'Silicone pots and pans that fold flat for backpacking. Heat-resistant, dishwasher safe, and lightweight. Includes nesting storage case.', category: 'product' },
  { title: 'Blockchain-Based Ticketing Platform', description: 'NFT tickets for concerts and events that prevent scalping. Resale price caps built into smart contracts. Artists get royalties on secondary sales.', category: 'tech' },
  { title: 'Fermentation Starter Kits', description: 'Everything needed to make kombucha, kimchi, or sourdough at home. Includes cultures, jars, and step-by-step video guides. Subscription refills available.', category: 'food' },
  { title: 'Mobile Car Detailing Fleet', description: 'Book detailing services through an app, we come to you. Eco-friendly products, waterless wash options. Target apartment dwellers and office parks.', category: 'service' },
  { title: 'Magnetic Phone Mount System', description: 'Universal mounting system for car, desk, and wall. Ultra-strong magnets, 360-degree rotation, wireless charging compatible. One mount, infinite uses.', category: 'product' },
  { title: 'AR Interior Design App', description: 'Point your phone at a room and virtually place furniture before buying. Measure spaces automatically, save designs, share with friends. Partnered with furniture retailers.', category: 'tech' },
  { title: 'Artisan Hot Sauce Marketplace', description: 'Curated platform for small-batch hot sauce makers. Monthly tasting boxes, maker profiles, heat level ratings. Build a community around spicy food.', category: 'food' },
  { title: 'Freelance Bookkeeping for Creators', description: 'Affordable bookkeeping service for YouTubers, streamers, and influencers. Track sponsorships, expenses, and quarterly taxes. Flat monthly fee.', category: 'service' },
  { title: 'Portable Espresso Maker', description: 'Battery-powered espresso machine for camping and travel. Makes cafe-quality shots anywhere. USB-C rechargeable, fits in a backpack.', category: 'product' },
  { title: 'Decentralized Cloud Storage', description: 'Peer-to-peer file storage using blockchain. Rent out unused hard drive space, earn crypto. More secure and private than Dropbox.', category: 'tech' },
  { title: 'Meal Prep Vending Machines', description: 'Automated kiosks in gyms and offices selling fresh, pre-portioned meals. Restock daily, track nutrition, accept mobile payments. Healthy fast food alternative.', category: 'food' },
  { title: 'Virtual Assistant for Seniors', description: 'Remote assistants help elderly people with appointments, bills, and errands. Video check-ins, medication reminders, family updates. Peace of mind for adult children.', category: 'service' },
  { title: 'Biodegradable Phone Cases', description: 'Protective cases made from plant-based materials. Compostable at end of life, stylish designs, same drop protection as plastic. Guilt-free tech accessories.', category: 'product' },
  { title: 'AI Resume Builder', description: 'Upload your LinkedIn, get a tailored resume for each job application. AI analyzes job descriptions and optimizes keywords. One-click cover letters included.', category: 'tech' },
  { title: 'Sourdough Bread Delivery', description: 'Weekly subscription for fresh-baked sourdough. Multiple flavors, local organic flour, no preservatives. Partner with coffee shops for pickup locations.', category: 'food' },
  { title: 'Laundry Pickup for Students', description: 'Dorm-to-dorm laundry service on college campuses. Wash, dry, fold, and deliver. Pay per pound or monthly unlimited. Target busy students and athletes.', category: 'service' },
  { title: 'Minimalist Wallet with Tracker', description: 'Slim wallet with built-in AirTag holder. RFID blocking, holds 8 cards, genuine leather. Never lose your wallet again.', category: 'product' },
  { title: 'Smart Contract Freelance Platform', description: 'Escrow payments released automatically when milestones are met. No disputes, no chargebacks. Blockchain-verified work history for reputation.', category: 'tech' },
  { title: 'Craft Cocktail Kits', description: 'Pre-measured ingredients for bar-quality cocktails at home. Includes garnishes, recipe cards, and bartending tips. New theme each month.', category: 'food' },
  { title: 'Dog Walking Marketplace', description: 'Connect dog owners with local walkers. Real-time GPS tracking, photo updates, and reviews. Walkers set their own rates and schedules.', category: 'service' },
  { title: 'Ergonomic Laptop Stand', description: 'Adjustable aluminum stand that raises screen to eye level. Folds flat for travel, built-in cable management, non-slip base. Prevent neck pain.', category: 'product' },
  { title: 'Personalized Vitamin Subscription', description: 'Take a quiz, get custom vitamin packs delivered monthly. DNA testing optional for advanced recommendations. Cancel anytime, track health metrics in app.', category: 'tech' },
  { title: 'Zero-Waste Grocery Store', description: 'Bulk foods, refillable containers, package-free produce. Customers bring their own bags and jars. Weigh, pay, and go. Reduce plastic waste.', category: 'food' }
];

const sampleFeedback = [
  'This is a great idea! Have you considered partnering with nutritionists?',
  'Love the concept. What about people with allergies?',
  'I would definitely use this. How much would it cost?',
  'Interesting approach. Have you looked at competitors in this space?',
  'This could work well in urban areas. What about rural markets?',
  'The tech stack sounds solid. Are you planning mobile-first?',
  'I see potential here. What\'s your go-to-market strategy?',
  'This reminds me of a similar product I saw. How will you differentiate?',
  'Great timing for this idea. The market is ready.',
  'I have experience in this industry. Happy to chat if you need advice.',
  'This solves a real problem I have. When can I sign up?',
  'Have you thought about the regulatory challenges?',
  'The pricing model makes sense. What about enterprise customers?',
  'I love the sustainability angle. More people care about this now.',
  'This could scale quickly. What are your funding plans?'
];

export const seedDatabase = () => {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Check if ideas table is already populated
      tx.executeSql(
        'SELECT COUNT(*) as count FROM ideas',
        [],
        (_, { rows: { _array } }) => {
          const ideaCount = _array[0].count;
          
          if (ideaCount > 0) {
            // Database already has data, skip seeding
            resolve();
            return;
          }

          // Create demo user
          tx.executeSql(
            'INSERT OR IGNORE INTO users (id, name, email, sparkScore, bio) VALUES (?, ?, ?, ?, ?)',
            [1, 'Demo User', 'demo@ideaspark.com', 150, 'Passionate about innovation and helping others bring their ideas to life!']
          );

          // Insert sample ideas
          sampleIdeas.forEach((idea) => {
            tx.executeSql(
              'INSERT INTO ideas (title, description, category) VALUES (?, ?, ?)',
              [idea.title, idea.description, idea.category],
              (_, result) => {
                // Add 1-3 feedback items per idea
                const feedbackCount = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < feedbackCount; i++) {
                  const randomFeedback = sampleFeedback[Math.floor(Math.random() * sampleFeedback.length)];
                  tx.executeSql(
                    'INSERT INTO feedback (ideaId, comment) VALUES (?, ?)',
                    [result.insertId, randomFeedback]
                  );
                }
              }
            );
          });
        },
        (_, error) => reject(error)
      );
    }, reject, resolve);
  });
};
