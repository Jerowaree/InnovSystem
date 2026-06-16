# AGENTS.md

# InnovSystem Transporte

## Project Overview

InnovSystem Transporte is an academic SaaS web platform designed for transportation companies.

The purpose of the platform is to provide a centralized dashboard where companies can:

* Consult company information.
* Visualize financial and operational movements.
* Analyze data through interactive charts.
* Generate Excel reports.
* Consume information from SUNAT services.
* Monitor key business indicators.

This project is intentionally limited in scope to maintain feasibility within an academic environment.

---

# Product Vision

InnovSystem should feel like a modern SaaS product rather than a traditional academic system.

The user experience should resemble products such as:

* Stripe
* Linear
* Notion
* Vercel

The application must prioritize:

* Simplicity
* Performance
* Clarity
* Data visualization
* Professional design

---

# Technical Stack

## Frontend

* Next.js 15 App Router
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React

## Backend

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage

## Data Visualization

* Recharts

## Reports

* ExcelJS

---

# Scope

The platform ONLY contains the following modules.

## Landing Page

Sections:

* Navbar
* Hero
* Trust Section
* Problem Section
* Solution Section
* How It Works
* Dashboard Showcase
* Benefits
* Reports
* SUNAT Integration
* CTA
* Footer

## Authentication

Pages:

* Login
* Register

## Dashboard

Features:

* KPI cards
* Charts
* Movements table
* Filters
* Report generation
* SUNAT information

## Reports

Generate:

* Sales Excel Report
* Purchases Excel Report
* Financial Summary Excel Report

## SUNAT

Allowed functionality:

* RUC lookup
* Company information lookup

Do NOT implement:

* Electronic invoicing
* PLE
* SIRE
* OSE
* XML signing
* Certificates
* Tax declaration systems

These are outside project scope.

---

# UI / UX Guidelines

## Design Philosophy

The interface must look modern, minimal and enterprise-grade.

Avoid:

* Heavy gradients
* Excessive shadows
* Colorful dashboards
* Academic-style layouts

Prefer:

* Clean spacing
* Large typography
* Neutral backgrounds
* Clear hierarchy

---

## Color Palette

Primary:

#2563EB

Primary Hover:

#1D4ED8

Success:

#16A34A

Warning:

#F59E0B

Danger:

#DC2626

Background:

#F8FAFC

Text:

#0F172A

---

## Typography

Use:

Inter

Weights:

* 400
* 500
* 600
* 700

---

# Hero Section Rules

IMPORTANT

The hero section must NOT occupy excessive vertical space.

Requirements:

* Full desktop viewport width
* Compact vertical spacing
* Dashboard preview visible above the fold
* Primary CTA visible immediately
* No giant illustrations pushing content downward

The hero must feel similar to:

* Stripe
* Vercel
* Ramp

---

# Dashboard Rules

The dashboard is the core feature.

Priority order:

1. KPI Cards
2. Main Chart
3. Movements Table
4. Reports
5. SUNAT Information

---

## KPI Cards

Display:

* Total Sales
* Total Purchases
* Estimated Profit
* IGV

---

## Charts

Required:

### Line Chart

Sales vs Purchases

### Donut Chart

Expense Distribution

### Bar Chart

Monthly Movements

Use Recharts.

---

# Architecture

Follow Feature-Based Architecture.

Structure:

src/

app/

components/

features/

dashboard/

reports/

sunat/

auth/

services/

lib/

hooks/

types/

---

# Coding Standards

## TypeScript

Always use strict typing.

Avoid:

* any
* implicit any

Prefer:

* interfaces
* types
* reusable DTOs

---

## Components

Keep components small.

Maximum recommendation:

200 lines per component.

Extract reusable logic into hooks.

---

## Data Fetching

Prefer:

* Server Components
* Server Actions
* Route Handlers

Avoid unnecessary client-side fetching.

---

# Database

Tables:

## companies

* id
* ruc
* business_name
* email
* created_at

## users

* id
* company_id
* email
* created_at

## movements

* id
* company_id
* movement_type
* document_type
* description
* amount
* date

## reports

* id
* company_id
* report_type
* file_url
* generated_at

---

# Security

Use:

* Supabase Auth
* Protected routes
* Server-side validation

Never:

* Trust client-side validation only
* Expose service role keys
* Store secrets in frontend code

---

# Development Principles

Before generating code:

1. Analyze requirements.
2. Identify edge cases.
3. Propose architecture.
4. Implement.
5. Refactor.
6. Optimize.

Always prioritize:

* Readability
* Maintainability
* Scalability
* Performance

Over clever code.

---

# Output Expectations

When implementing features:

* Explain architectural decisions.
* Explain tradeoffs.
* Generate production-quality code.
* Follow existing project structure.
* Avoid overengineering.

Act as a Senior Software Engineer and Technical Lead at all times.
