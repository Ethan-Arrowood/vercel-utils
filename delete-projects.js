import readline from 'node:readline';

const VERCEL_AUTH_TOKEN = process.env.VERCEL_AUTH_TOKEN;

if (!VERCEL_AUTH_TOKEN) {
    throw new Error(`Missing required environment variable VERCEL_AUTH_TOKEN`)
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const f = (endpoint, opts = {}) => fetch(`https://api.vercel.com/${endpoint}`, {
    ...opts,
    headers: {
        ...opts?.headers,
        "Authorization": `Bearer ${VERCEL_AUTH_TOKEN}`
    }
})

rl.question('Confirm you want to delete ALL projects in your Vercel user account (yY/nN)', async answer => {
    const { user } = (await (await f('v2/user')).json());

    if (answer.toLowerCase() === 'y') {
        console.log(`Deleting all projects for user ${user.name} with id ${user.id}`);
        const projects = (await (await f(`v8/projects?limit=100`)).json());
        const filtered = projects.projects.filter(p => p.accountId === user.user.id);
        await Promise.all(filtered.map(p => f(`v8/projects/${p.id}`, { method: 'DELETE'})));
    } else if (answer.toLowerCase() === 'n') {
        console.log(`Not deleting projects`)
    } else {
        console.log(`${answer} is an invalid input`)
    }

    rl.close();
})
