# Supabase Setup Guide

This guide walks you through setting up Supabase for the NearNow app.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: nearnow (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for MVP
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be provisioned

## Step 2: Run the SQL Migration

1. In your Supabase project dashboard, click on the **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this means all tables were created successfully

### Verify the Migration

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - `profiles`
   - `broadcasts`
   - `chats`
   - `messages`
3. Click on each table to verify the columns match the schema

## Step 3: Enable Phone Authentication

1. In your Supabase dashboard, click **Authentication** in the left sidebar
2. Click on **Providers**
3. Find **Phone** in the list and click to expand it
4. Toggle **Enable Phone provider** to ON
5. Choose a phone provider:
   - **Twilio** (recommended for production)
   - **MessageBird**
   - **Vonage**
6. For development/testing, you can use Supabase's test OTP:
   - Leave provider settings empty
   - Test OTPs will be logged in the Auth logs (not sent to real phones)
7. Click **Save**

### Twilio Setup (Production)

If using Twilio for production:

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number with SMS capabilities
4. In Supabase Phone provider settings:
   - **Twilio Account SID**: Your Twilio Account SID
   - **Twilio Auth Token**: Your Twilio Auth Token
   - **Twilio Message Service SID**: Your Messaging Service SID (or leave blank to use phone number)
   - **Twilio Phone Number**: Your Twilio phone number (format: +1234567890)
5. Click **Save**

## Step 4: Get Your API Keys

1. In your Supabase dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** under Project Settings
3. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
4. Keep this page open - you'll need these values in the next step

## Step 5: Configure Environment Variables

1. In your project root, create a `.env` file (if it doesn't exist)
2. Copy the contents from `.env.example`:
