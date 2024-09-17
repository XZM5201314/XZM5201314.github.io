// 模拟照片数据
const photos = [
    { src: 'F:/网站/imgs/photo1.jpg' },
    { src: 'F:/网站/imgs/photo2.jpg' },
    { src: 'F:/网站/imgs/photo3.jpg' },
    // 如果有更多照片，请继续添加...
];

// 从localStorage加载文章数据，如果没有则使用默认数据
let articles = JSON.parse(localStorage.getItem('articles')) || [
    { id: 1, title: '我的第一篇文章', content: '这是文章内容...', likes: 0, comments: [], isPrivate: false },
    { id: 2, title: '有趣的经历', content: '这是另一篇文章的内容...', likes: 0, comments: [], isPrivate: false },
];

// 保存文章数据到localStorage
function saveArticles() {
    localStorage.setItem('articles', JSON.stringify(articles));
}

// 加载照片
function loadPhotos() {
    const photosSection = document.getElementById('photos');
    photosSection.innerHTML = ''; // 清空现有内容
    photos.forEach(photo => {
        const photoElement = document.createElement('a');
        photoElement.href = 'https://sr.mihoyo.com/?nav=home';
        photoElement.target = '_blank'; // 在新标签页中打开链接
        photoElement.className = 'photo';
        photoElement.innerHTML = `
            <img src="${photo.src}" alt="照片">
        `;
        photosSection.appendChild(photoElement);
    });
}

// 加载文章
function loadArticles() {
    const articlesSection = document.getElementById('articles');
    articlesSection.innerHTML = ''; // 清空现有内容
    articles.forEach(article => {
        if (!article.isPrivate || (currentUser && currentUser.isAdmin)) {
            const articleElement = document.createElement('article');
            articleElement.setAttribute('data-id', article.id);
            articleElement.innerHTML = `
                <h2>${article.title} ${article.isPrivate ? '(隐私)' : ''}</h2>
                <p class="article-content">${article.content}</p>
                <p>点赞数: ${article.likes}</p>
                ${currentUser ? `
                    <button class="like-btn" data-id="${article.id}"><i class="fas fa-heart"></i> 点赞</button>
                    <div class="comment-section">
                        <textarea class="comment-input" placeholder="写下你的评论..."></textarea>
                        <button class="comment-btn" data-id="${article.id}"><i class="fas fa-comment"></i> 发表评论</button>
                    </div>
                ` : '<p>登录后可以点赞和评论</p>'}
                ${currentUser && currentUser.isAdmin ? `
                    <button class="edit-article-btn" data-id="${article.id}"><i class="fas fa-edit"></i> 编辑文章</button>
                ` : ''}
                <div class="comments-list"></div>
            `;
            articlesSection.appendChild(articleElement);
        }
    });

    if (currentUser) {
        // 添加点赞按钮事件监听器
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', handleLike);
        });

        // 添加评论按钮事件监听器
        document.querySelectorAll('.comment-btn').forEach(button => {
            button.addEventListener('click', handleComment);
        });
    }

    // 加载现有评论
    loadComments();

    // 为管理员添加编辑文章按钮的事件监听器
    if (currentUser && currentUser.isAdmin) {
        document.querySelectorAll('.edit-article-btn').forEach(button => {
            button.addEventListener('click', editArticle);
        });
    }
}

// 处理点赞
function handleLike(event) {
    if (!currentUser) {
        alert('请先登录后再点赞');
        return;
    }
    const articleId = parseInt(event.target.getAttribute('data-id'));
    const article = articles.find(a => a.id === articleId);
    if (article) {
        article.likes++;
        event.target.textContent = `点赞 (${article.likes})`;
        saveArticles(); // 保存更新后的文章数据
    }
}

// 处理评论
function handleComment(event) {
    if (!currentUser) {
        alert('请先登录后再评论');
        return;
    }

    const articleId = parseInt(event.target.getAttribute('data-id'));
    const article = articles.find(a => a.id === articleId);
    const commentInput = event.target.previousElementSibling;
    const commentText = commentInput.value.trim();

    if (article && commentText) {
        const comment = {
            id: Date.now(), // 使用时间戳作为评论ID
            text: commentText,
            date: new Date().toLocaleString(),
            user: currentUser.username
        };
        article.comments.push(comment);
        commentInput.value = '';
        saveArticles(); // 保存更新后的文章数据
        loadComments();
    }
}

// 加载评论
function loadComments() {
    articles.forEach(article => {
        const commentsListElement = document.querySelector(`article[data-id="${article.id}"] .comments-list`);
        commentsListElement.innerHTML = '';
        article.comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <p>${comment.text}</p>
                <small>${comment.user} - ${comment.date}</small>
                ${currentUser && currentUser.isAdmin ? `<button class="delete-comment-btn" data-article-id="${article.id}" data-comment-id="${comment.id}"><i class="fas fa-trash"></i> 删除评论</button>` : ''}
            `;
            commentsListElement.appendChild(commentElement);
        });
    });

    // 为管理员添加删除评论按钮的事件监听器
    if (currentUser && currentUser.isAdmin) {
        document.querySelectorAll('.delete-comment-btn').forEach(button => {
            button.addEventListener('click', deleteComment);
        });
    }
}

// 删除评论
function deleteComment(event) {
    const articleId = parseInt(event.target.getAttribute('data-article-id'));
    const commentId = parseInt(event.target.getAttribute('data-comment-id'));
    const article = articles.find(a => a.id === articleId);
    if (article) {
        article.comments = article.comments.filter(c => c.id !== commentId);
        saveArticles(); // 保存更新后的文章数据
        loadComments();
    }
}

// 显示点赞和评论记录
function showRecords() {
    const recordsElement = document.createElement('div');
    recordsElement.id = 'records';
    recordsElement.innerHTML = '<h3>点赞和评论记录</h3>';
    
    articles.forEach(article => {
        recordsElement.innerHTML += `
            <h4>${article.title}</h4>
            <p>点赞数: ${article.likes}</p>
            <p>评论数: ${article.comments.length}</p>
            <ul>
                ${article.comments.map(comment => `<li>${comment.text} (${comment.date})</li>`).join('')}
            </ul>
        `;
    });

    document.body.appendChild(recordsElement);
}

// 清除所有点赞和评论
function clearAllRecords() {
    articles.forEach(article => {
        article.likes = 0;
        article.comments = [];
    });
    saveArticles(); // 保存更新后的文章数据
    loadArticles(); // 重新加载文章以更新显示
    alert('所有点赞和评论已清除');
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    loadPhotos();
    loadArticles();
    startPhotoCarousel();

    // 添加登录表单事件监听器
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // 添加注册表单事件监听器
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // 添加退出登录按钮事件监听器
    document.getElementById('logout-btn').addEventListener('click', logout);

    // 添加登录状态显示元素
    const loginStatusElement = document.createElement('div');
    loginStatusElement.id = 'login-status';
    document.body.insertBefore(loginStatusElement, document.body.firstChild);

    // 如果有当前用户，显示欢迎信息和管理员控制（如果是管理员）
    if (currentUser) {
        document.getElementById('login-message').textContent = `欢迎回来，${currentUser.username}！`;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block';
        if (currentUser.isAdmin) {
            showAdminControls();
        }
    }

    updateLoginStatus();

    // 只有管理员可以看到这些按钮
    if (currentUser && currentUser.isAdmin) {
        // 添加查看记录按钮
        const recordButton = document.createElement('button');
        recordButton.innerHTML = '<i class="fas fa-list"></i> 查看点赞和评论记录';
        recordButton.addEventListener('click', showRecords);
        document.body.appendChild(recordButton);

        // 添加清除记录按钮
        const clearButton = document.createElement('button');
        clearButton.innerHTML = '<i class="fas fa-trash"></i> 清除所有点赞和评论';
        clearButton.addEventListener('click', clearAllRecords);
        document.body.appendChild(clearButton);
    }
});

let currentPhotoIndex = 0;

function showNextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    loadPhotos();
}

function startPhotoCarousel() {
    setInterval(showNextPhoto, 5000); // 每5秒切换一次照片
}

// 从localStorage加载用户数据，如果没有则使用默认数据
let users = JSON.parse(localStorage.getItem('users')) || [
    { username: 'xzm', password: 'mumu0328', phone: '18819156795', isAdmin: true },
];

// 删除 xzm1 和 xzm2 账户
users = users.filter(user => user.username !== 'xzm1' && user.username !== 'xzm2');

// 保存更新后的用户数据到localStorage
saveUsers();

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// 保存用户数据到localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// 保存当前用户到localStorage
function saveCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        saveCurrentUser();
        document.getElementById('login-message').textContent = `欢迎回来，${user.username}！`;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block'; // 显示退出登录按钮
        updateLoginStatus();
        
        // 移除现有的管理员控制（如果有）
        const existingAdminControls = document.getElementById('admin-controls');
        if (existingAdminControls) {
            existingAdminControls.remove();
        }
        
        // 只为管理员显示管理员控制
        if (user.isAdmin) {
            showAdminControls();
        }

        // 重新加载文章以显示点赞和评论功能
        loadArticles();
    } else {
        document.getElementById('login-message').textContent = '用户名或密码错误。';
    }
}

// 退出登录功能
function logout() {
    currentUser = null;
    saveCurrentUser();
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('login-form').reset(); // 清空登录表单
    document.getElementById('login-message').textContent = '您已成功退出登录。';
    document.getElementById('logout-btn').style.display = 'none'; // 隐藏退出登录按钮
    
    // 移除管理员控制
    const adminControls = document.getElementById('admin-controls');
    if (adminControls) {
        adminControls.remove();
    }
    
    updateLoginStatus();

    // 重新加载文章以隐藏点赞和评论功能
    loadArticles();
}

// 更新登录状态显示
function updateLoginStatus() {
    const loginStatusElement = document.getElementById('login-status');
    if (currentUser) {
        loginStatusElement.textContent = `当前登录用户：${currentUser.username}`;
        document.getElementById('logout-btn').style.display = 'inline-block';
    } else {
        loginStatusElement.textContent = '未登录';
        document.getElementById('logout-btn').style.display = 'none';
    }
}

// 处理注册
function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const phone = document.getElementById('register-phone').value;

    if (users.some(u => u.username === username)) {
        document.getElementById('register-message').textContent = '用户名已存在，请选择其他用户名。';
        return;
    }

    const newUser = { username, password, phone, isAdmin: false };
    users.push(newUser);
    saveUsers();
    document.getElementById('register-message').textContent = '注册成功！请登录。';
    document.getElementById('register-form').reset();
}

// 显示管理员控制
function showAdminControls() {
    if (currentUser && currentUser.isAdmin) {
        const adminControls = document.createElement('div');
        adminControls.id = 'admin-controls';
        adminControls.innerHTML = `
            <button id="add-article-btn"><i class="fas fa-plus"></i> 添加文章</button>
            <button id="add-private-article-btn"><i class="fas fa-user-secret"></i> 添加隐私文章</button>
            <button id="delete-article-btn"><i class="fas fa-trash"></i> 删除文章</button>
            <select id="article-select" style="display:none;">
                <option value="">选择要删除的文章</option>
            </select>
            <button id="view-all-users-btn"><i class="fas fa-users"></i> 查看所有用户信息</button>
        `;
        document.getElementById('login-area').appendChild(adminControls);
        
        document.getElementById('add-article-btn').addEventListener('click', addArticle);
        document.getElementById('add-private-article-btn').addEventListener('click', addPrivateArticle);
        document.getElementById('delete-article-btn').addEventListener('click', toggleDeleteArticleSelect);
        document.getElementById('article-select').addEventListener('change', deleteSelectedArticle);
        document.getElementById('view-all-users-btn').addEventListener('click', viewAllUsers);

        populateArticleSelect();
    }
}

// 填充文章选择下拉菜单
function populateArticleSelect() {
    const select = document.getElementById('article-select');
    select.innerHTML = '<option value="">选择要删除的文章</option>';
    articles.forEach(article => {
        const option = document.createElement('option');
        option.value = article.id;
        option.textContent = article.title;
        select.appendChild(option);
    });
}

// 切换文章选择下拉菜单的显示
function toggleDeleteArticleSelect() {
    const select = document.getElementById('article-select');
    select.style.display = select.style.display === 'none' ? 'inline-block' : 'none';
    if (select.style.display === 'inline-block') {
        populateArticleSelect();
    }
}

// 删除选中的文章
function deleteSelectedArticle() {
    const select = document.getElementById('article-select');
    const articleId = parseInt(select.value);
    if (articleId) {
        confirmDeleteArticle(articleId);
        select.style.display = 'none';
    }
}

// 确认删除文章
function confirmDeleteArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (article) {
        const confirmDelete = confirm(`确定要删除文章 "${article.title}" 吗？`);
        if (confirmDelete) {
            articles = articles.filter(a => a.id !== articleId);
            saveArticles();
            loadArticles();
            populateArticleSelect();
            alert('文章已成功删除。');
        }
    } else {
        alert('未找到指定ID的文章。');
    }
}

// 查看所有用户信息
function viewAllUsers() {
    if (currentUser && currentUser.isAdmin) {
        let userInfo = '所有用户信息：\n\n';
        users.forEach(user => {
            userInfo += `用户名: ${user.username}, 电话: ${user.phone}, 管理员: ${user.isAdmin ? '是' : '否'}\n`;
        });
        alert(userInfo);
    } else {
        alert('您没有权限查看所有用户信息。');
    }
}

// 添加文章
function addArticle() {
    const title = prompt('请输入文章标题：');
    const content = prompt('请输入文章内容：');
    if (title && content) {
        const newArticle = {
            id: articles.length + 1,
            title: title,
            content: content,
            likes: 0,
            comments: [],
            isPrivate: false
        };
        articles.push(newArticle);
        saveArticles(); // 保存更新后的文章数据
        loadArticles();
    }
}

// 添加隐私文章
function addPrivateArticle() {
    const title = prompt('请输入隐私文章标题：');
    const content = prompt('请输入隐私文章内容：');
    if (title && content) {
        const newArticle = {
            id: articles.length + 1,
            title: title,
            content: content,
            likes: 0,
            comments: [],
            isPrivate: true
        };
        articles.push(newArticle);
        saveArticles();
        loadArticles();
    }
}

// 处理社交媒体图标点击
document.addEventListener('DOMContentLoaded', function() {
    const wechat = document.getElementById('wechat');
    const tiktok = document.getElementById('tiktok');
    const phone = document.getElementById('phone');
    const socialInfo = document.getElementById('social-info');

    if (wechat && tiktok && phone && socialInfo) {
        wechat.addEventListener('click', function(e) {
            e.preventDefault();
            socialInfo.textContent = '微信：18819156795';
        });

        tiktok.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://v.douyin.com/ikDqs1cA/', '_blank');
        });

        phone.addEventListener('click', function(e) {
            e.preventDefault();
            socialInfo.textContent = '电话：18819156795';
        });
    } else {
        console.error('One or more social media elements not found');
    }
});

// 添加编辑文章函数
function editArticle(event) {
    const articleId = parseInt(event.target.getAttribute('data-id'));
    const article = articles.find(a => a.id === articleId);
    if (article) {
        const newTitle = prompt('请输入新的文章标题：', article.title);
        const newContent = prompt('请输入新的文章内容：', article.content);
        if (newTitle !== null && newContent !== null) {
            article.title = newTitle;
            article.content = newContent;
            saveArticles();
            loadArticles();
        }
    }
}