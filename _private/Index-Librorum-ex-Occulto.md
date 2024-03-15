---
layout: page
title: Index librorum ex occulto
is_index: true
---

This act as a hidden index for book posts.
<ul>
{% assign sorted_private_posts = site.private | sort: 'date' | reverse %}
{% for item in sorted_private_posts %}
  {% unless item.is_index %}
    <li>
      <a href="{{ item.url }}">{{ item.title }}</a> - {{ item.date | date: "%B %d, %Y" }}
    </li>
  {% endunless %}
{% endfor %}
</ul>