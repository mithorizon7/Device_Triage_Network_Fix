# Translation Glossary

This glossary ensures consistent terminology across all locales (English, Latvian, Russian) for the Device Triage + Network Fix-It Planner application.

## Domain Terms (Do Not Translate)

These terms are product/technical names and should remain in English across all locales:

| Term | Notes |
|------|-------|
| Wi-Fi | Standard wireless networking term |
| WPA2 | Security protocol name |
| WPA3 | Security protocol name |
| IoT | Internet of Things acronym |
| MFA | Multi-Factor Authentication acronym |
| IP | Internet Protocol |
| MAC | Media Access Control (address) |

## Core Terminology

| English | Latvian | Russian | Context |
|---------|---------|---------|---------|
| Risk Score | Riska vērtējums | Оценка риска | The numerical security score |
| Trust Zone | Uzticamības zona | Зона доверия | Network segmentation areas |
| Main Network | Galvenais tīkls | Основная сеть | Primary trusted network |
| Guest Network | Viesu tīkls | Гостевая сеть | Visitor-only network |
| IoT Network | IoT tīkls | Сеть IoT | Smart device network |
| Investigate | Izmeklēt | Расследовать | Quarantine zone for unknowns |
| Device | Ierīce | Устройство | Any network-connected device |
| Scenario | Scenārijs | Сценарий | Training exercise |
| Controls | Kontroles | Настройки | Security settings |
| Badge | Nozīmīte | Значок | Achievement/reward |

## Security Controls

| English | Latvian | Russian |
|---------|---------|---------|
| Strong Password | Spēcīga parole | Надежный пароль |
| Auto Updates | Automātiskie atjauninājumi | Автообновления |
| Default Passwords | Noklusējuma paroles | Пароли по умолчанию |
| Guest Network Enabled | Viesu tīkls iespējots | Гостевая сеть включена |
| IoT Network Enabled | IoT tīkls iespējots | Сеть IoT включена |

## Risk Flags

| English | Latvian | Russian |
|---------|---------|---------|
| unknown device | nezināma ierīce | неизвестное устройство |
| IoT device | IoT ierīce | устройство IoT |
| visitor device | viesu ierīce | устройство гостя |
| trusted work device | uzticama darba ierīce | доверенное рабочее устройство |

## UI Actions

| English | Latvian | Russian |
|---------|---------|---------|
| Start | Sākt | Начать |
| Continue | Turpināt | Продолжить |
| Cancel | Atcelt | Отмена |
| Save | Saglabāt | Сохранить |
| Reset | Atiestatīt | Сбросить |
| Close | Aizvērt | Закрыть |
| Edit | Rediģēt | Редактировать |
| Delete | Dzēst | Удалить |
| Export | Eksportēt | Экспорт |
| Import | Importēt | Импорт |

## Synergies

| English | Latvian | Russian |
|---------|---------|---------|
| IoT Isolation | IoT izolācija | Изоляция IoT |
| Guest Segmentation | Viesu segmentācija | Сегментация гостей |
| Threat Quarantine | Draudu karantīna | Карантин угроз |
| Defense in Depth | Daudzslāņu aizsardzība | Глубокая защита |
| Active Maintenance | Aktīva uzturēšana | Активное обслуживание |

## Translation Guidelines

### General Rules
1. **Avoid word-for-word translation** - Translate meaning, not individual words
2. **Use formal register** - Professional, educational tone
3. **Keep technical accuracy** - Security terms must be precise
4. **Test in context** - Verify translations fit in UI space

### Latvian-Specific
- Use proper diacritics (ā, ē, ī, ū, ķ, ļ, ņ, š, ž)
- Latvian has 2 plural forms (singular, plural)
- Prefer active voice

### Russian-Specific
- Use proper Cyrillic characters
- Russian has 4 plural forms (one, few, many, other)
- Pay attention to grammatical gender
- Use formal "вы" (you) form

## Key Naming Convention

Translation keys follow this pattern:
```
{namespace}.{screen/component}.{element}
```

Examples:
- `app.title` - Application title
- `header.tutorial` - Tutorial button in header
- `zones.main` - Main zone label
- `zones.mainDescription` - Main zone description
- `controls.wifiSecurity` - Wi-Fi security control
- `notifications.badgeEarned` - Badge earned notification
- `author.deviceDefaultName` - Default device name in author
- `badges.firstSteps` - First Steps badge name

## Quality Sign-off

Translation quality is reviewed by:
1. Developer (technical accuracy)
2. Native speaker (linguistic quality)
3. QA (UI fit and context)
