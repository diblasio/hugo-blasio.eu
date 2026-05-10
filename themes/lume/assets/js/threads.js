// Social thread embeds: Mastodon and Bluesky
(function() {
  'use strict';

  async function loadMastodonThread(container, threadUrl) {
    try {
      var match = threadUrl.match(/https?:\/\/([^\/]+)\/@([^\/]+)\/(\d+)/);
      if (!match) throw new Error('Invalid Mastodon URL format');
      var host = match[1];
      var id = match[3];

      var response = await fetch('https://' + host + '/api/v1/statuses/' + id + '/context');
      if (!response.ok) throw new Error('Failed to load Mastodon context');
      var data = await response.json();

      renderMastodonReplies(container, data.descendants || []);
    } catch (err) {
      container.innerHTML =
        '<p class="thread-error">Could not load replies.</p>' +
        '<a href="' + threadUrl + '" target="_blank" rel="noopener">View on Mastodon →</a>';
    }
  }

  function renderMastodonReplies(container, replies) {
    if (replies.length === 0) {
      container.innerHTML = '<p class="thread-loading">No replies yet.</p>';
      return;
    }

    var ul = document.createElement('ul');
    ul.className = 'thread-list';
    replies.forEach(function(reply) {
      var li = document.createElement('li');
      li.className = 'thread-item';
      li.innerHTML =
        '<div class="thread-author">' +
        '<img src="' + reply.account.avatar + '" alt="" class="thread-avatar">' +
        '<span class="thread-name">' + escapeHtml(reply.account.display_name || reply.account.username) + '</span>' +
        '<span class="thread-handle">@' + reply.account.acct + '</span>' +
        '</div>' +
        '<div class="thread-body">' + reply.content + '</div>' +
        '<a href="' + reply.url + '" target="_blank" rel="noopener" class="thread-link">' + formatDate(reply.created_at) + '</a>';
      ul.appendChild(li);
    });
    container.innerHTML = '';
    container.appendChild(ul);
  }

  async function loadBlueskyThread(container, atUri, webUrl) {
    try {
      if (!atUri) throw new Error('No AT URI provided');
      var encodedUri = encodeURIComponent(atUri);
      var response = await fetch('https://api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=' + encodedUri);
      if (!response.ok) throw new Error('Failed to load Bluesky thread');
      var data = await response.json();

      renderBlueskyReplies(container, data.thread && data.thread.replies ? data.thread.replies : [], webUrl);
    } catch (err) {
      var fallback = webUrl || '#';
      container.innerHTML =
        '<p class="thread-error">Could not load replies.</p>' +
        '<a href="' + fallback + '" target="_blank" rel="noopener">View on Bluesky →</a>';
    }
  }

  function renderBlueskyReplies(container, replies) {
    if (!replies || replies.length === 0) {
      container.innerHTML = '<p class="thread-loading">No replies yet.</p>';
      return;
    }

    var ul = document.createElement('ul');
    ul.className = 'thread-list';
    replies.forEach(function(reply) {
      var post = reply.post;
      var author = post.author;
      var postId = post.uri.split('/').pop();
      var li = document.createElement('li');
      li.className = 'thread-item';
      li.innerHTML =
        '<div class="thread-author">' +
        '<img src="' + author.avatar + '" alt="" class="thread-avatar">' +
        '<span class="thread-name">' + escapeHtml(author.displayName || author.handle) + '</span>' +
        '<span class="thread-handle">@' + author.handle + '</span>' +
        '</div>' +
        '<div class="thread-body">' + escapeHtml(post.record.text) + '</div>' +
        '<a href="https://bsky.app/profile/' + author.handle + '/post/' + postId + '" target="_blank" rel="noopener" class="thread-link">' + formatDate(post.indexedAt) + '</a>';
      ul.appendChild(li);
    });
    container.innerHTML = '';
    container.appendChild(ul);
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(isoString) {
    var date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var container = entry.target;
        var mastodonUrl = container.dataset.mastodonThread;
        var blueskyUri = container.dataset.blueskyThread;
        var blueskyUrl = container.dataset.blueskyUrl;

        if (mastodonUrl) loadMastodonThread(container, mastodonUrl);
        if (blueskyUri) loadBlueskyThread(container, blueskyUri, blueskyUrl);

        observer.unobserve(container);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.thread-content').forEach(function(el) { observer.observe(el); });
  }
})();
