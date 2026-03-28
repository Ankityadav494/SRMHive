const mongoose = require('mongoose');
require('dotenv').config();

const applicationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const A = mongoose.model('Application', applicationSchema);
  const P = mongoose.model('Project', projectSchema);

  const apps = await A.find({}).lean();
  const projs = await P.find({}).lean();

  console.log('\n=== APPLICATIONS ===');
  apps.forEach(a => {
    console.log(`  app._id: ${a._id}`);
    console.log(`  project: ${a.project}`);
    console.log(`  applicant: ${a.applicant}`);
    console.log(`  status: ${a.status}`);
    console.log('---');
  });

  console.log('\n=== PROJECTS ===');
  projs.forEach(p => {
    console.log(`  project._id: ${p._id}  title: ${p.title}  owner: ${p.owner}`);
  });

  // Check if any application's project matches a project
  console.log('\n=== MATCH CHECK ===');
  apps.forEach(a => {
    const match = projs.find(p => p._id.toString() === a.project?.toString());
    console.log(`App ${a._id} -> project match: ${match ? match.title : 'NO MATCH'}`);
  });

  mongoose.disconnect();
}).catch(e => console.error('Error:', e.message));
