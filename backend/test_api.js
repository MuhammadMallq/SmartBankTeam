const http = require('http');

async function request(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: responseBody
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log("Starting API Tests...\n");
    let results = [];
    let userId;

    try {
        // 1. GET /api/news
        let res = await request('/api/news');
        results.push({ endpoint: 'GET /api/news', status: res.status, ok: res.status === 200 });

        // 2. POST /api/register
        const testUserEmail = `test${Date.now()}@test.com`;
        res = await request('/api/register', 'POST', {
            name: "Test User",
            email: testUserEmail,
            password: "password123"
        });
        results.push({ endpoint: 'POST /api/register', status: res.status, ok: res.status === 200 });
        if (res.status === 200) {
            const data = JSON.parse(res.body);
            userId = data.id;
        }

        // 3. POST /api/login
        res = await request('/api/login', 'POST', {
            email: testUserEmail,
            password: "password123"
        });
        results.push({ endpoint: 'POST /api/login', status: res.status, ok: res.status === 200 });

        // 4. GET /api/dashboard/data
        res = await request(`/api/dashboard/data?userId=${userId || 'USR-00142'}`);
        results.push({ endpoint: 'GET /api/dashboard/data', status: res.status, ok: res.status === 200 });

        // 5. POST /api/transfer
        res = await request('/api/transfer', 'POST', {
            amount: 100,
            to_user: "NSB-001",
            from_user: userId || 'USR-00142',
            to_name: "Hendra Wijaya"
        });
        results.push({ endpoint: 'POST /api/transfer', status: res.status, ok: res.status === 200 });

        // 6. GET /api/admin/users
        res = await request('/api/admin/users');
        results.push({ endpoint: 'GET /api/admin/users', status: res.status, ok: res.status === 200 });
        
        let targetUserId = userId;
        if (!targetUserId && res.status === 200) {
            const users = JSON.parse(res.body);
            if (users.length > 0) targetUserId = users[0].id;
        }

        // 7. GET /api/admin/ledgers
        res = await request('/api/admin/ledgers');
        results.push({ endpoint: 'GET /api/admin/ledgers', status: res.status, ok: res.status === 200 });

        // 8. GET /api/admin/fees
        res = await request('/api/admin/fees');
        results.push({ endpoint: 'GET /api/admin/fees', status: res.status, ok: res.status === 200 });

        // 9. GET /api/admin/stats
        res = await request('/api/admin/stats');
        results.push({ endpoint: 'GET /api/admin/stats', status: res.status, ok: res.status === 200 });

        // 10. PUT /api/admin/users/:id/role
        if (targetUserId) {
            res = await request(`/api/admin/users/${targetUserId}/role`, 'PUT', { role: "admin" });
            results.push({ endpoint: 'PUT /api/admin/users/:id/role', status: res.status, ok: res.status === 200 });

            // 11. PUT /api/admin/users/:id/status
            res = await request(`/api/admin/users/${targetUserId}/status`, 'PUT');
            results.push({ endpoint: 'PUT /api/admin/users/:id/status', status: res.status, ok: res.status === 200 });
        } else {
            results.push({ endpoint: 'PUT /api/admin/users/:id/role', status: 'skipped', ok: false });
            results.push({ endpoint: 'PUT /api/admin/users/:id/status', status: 'skipped', ok: false });
        }

        // 12. POST /api/admin/users
        res = await request('/api/admin/users', 'POST', {
            name: "Admin Test",
            email: `admin${Date.now()}@test.com`,
            password: "adminpass",
            role: "admin"
        });
        results.push({ endpoint: 'POST /api/admin/users', status: res.status, ok: res.status === 200 });

    } catch (e) {
        console.error("Test failed to execute properly:", e);
    }

    console.table(results);
}

runTests();
