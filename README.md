# Zabbix Ping Trapper

## Overview
**Zabbix Ping Trapper** is a lightweight Node.js service that monitors ping latency and packet loss for configured targets and sends the results to a Zabbix server using **Zabbix Trapper items**.

It is designed to be simple, flexible, and easy to deploy using Docker, while also supporting non-Docker execution for development or custom environments.

---

## Features
- Monitor ping latency for multiple targets
- Calculate and send packet loss metrics
- Send data to Zabbix using trapper items
- Ready-to-use Docker image
- Cron-based execution schedule (seconds-level)

---

## Prerequisites
- Access to a Zabbix server
- Zabbix host with **Trapper items** already configured
- One of the following:
    - Docker (recommended)
    - Node.js (for non-Docker usage)

---

