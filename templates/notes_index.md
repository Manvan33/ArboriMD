# Backup from {{ site_hostname }}

_Backup created automatically on {{ backup_date }}_
{% for folder, entries in notes.items() %}
## {{ folder }}
{% for entry in entries %}
- [{{ entry.title }}](notes/{{ entry.id }}.md) - [view online]({{ site_url }}{{ entry.id }})
{% endfor %}{% endfor %}
