const BASE_URL = "https://jsonplaceholder.typicode.com";

const cache = new WeakMap();

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API request failed");
    return res.json();
}

async function fetchDashboardData() {
    const results = await Promise.allSettled([
        fetchJSON(`${BASE_URL}/users`),
        fetchJSON(`${BASE_URL}/posts`),
        fetchJSON(`${BASE_URL}/comments`)
    ]);

    const [usersRes, postsRes, commentsRes] = results;
    const users = usersRes.status === "fulfilled" ? usersRes.value : [];
    const posts = postsRes.status === "fulfilled" ? postsRes.value : [];
    const comments = commentsRes.status === "fulfilled" ? commentsRes.value : [];

    const usersWithPosts = users.map(user => {
        const userPosts = posts.filter(p => p.userId === user.id).map(post => {
            const postComments = comments.filter(c => c.postId === post.id);
            return { ...post, comments: postComments };
        });
        return { ...user, posts: userPosts };
    });

    return usersWithPosts;
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function throttle(fn, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

async function searchUsers(queryObj) {
    if (!cache.has(queryObj)) {
        const data = await fetchDashboardData();
        const result = data.filter(u => u.name.toLowerCase().includes(queryObj.query.toLowerCase()));
        cache.set(queryObj, result);
    }
    return cache.get(queryObj);
}

const debouncedSearch = debounce(async q => {
    const queryObj = { query: q };
    const res = await searchUsers(queryObj);
    console.log("Search result for", q, res.map(u => u.name));
}, 500);

const throttledScroll = throttle(async () => {
    const data = await fetchDashboardData();
    console.log("Scroll load users:", data.map(u => u.name));
}, 2000);

async function main() {
    const dashboard = await fetchDashboardData();
    console.log("Dashboard loaded users:", dashboard.map(u => u.name));

    debouncedSearch("Leanne");
    debouncedSearch("Ervin");

    setTimeout(throttledScroll, 3000);
    setTimeout(throttledScroll, 6000);
};

main();