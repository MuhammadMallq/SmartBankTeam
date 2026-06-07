const fs = require('fs');
const path = require('path');

const files = [
	'src/pages/teller/teller-login.js',
	'src/pages/landing/main.js',
	'src/pages/manager/manager-login.js',
	'src/pages/operator/operator-dashboard.js',
	'src/pages/operator/operator-login.js',
	'src/pages/manager/manager-dashboard.js',
	'src/pages/auth/login.js',
	'src/pages/admin/admin-dashboard.js',
	'src/pages/admin/admin-login.js',
	'src/admin/dashboard.js'
];

files.forEach(f => {
	const filePath = path.join(__dirname, f);
	if (fs.existsSync(filePath)) {
		let content = fs.readFileSync(filePath, 'utf-8');
		// Replace anything that ends with dummy_data.json
		content = content.replace(/['"`](\.\.\/)*\.\.\/public\/dummy_data\.json['"`]/g, "'http://localhost:3000/api/data'");
        content = content.replace(/['"`](\.\.\/)*public\/dummy_data\.json['"`]/g, "'http://localhost:3000/api/data'");
		content = content.replace(/['"`]\/dummy_data\.json['"`]/g, "'http://localhost:3000/api/data'");
		content = content.replace(/['"`]dummy_data\.json['"`]/g, "'http://localhost:3000/api/data'");
        content = content.replace(/['"`]\.\.\/dummy_data\.json['"`]/g, "'http://localhost:3000/api/data'");
		fs.writeFileSync(filePath, content);
		console.log('Replaced in', f);
	}
});
