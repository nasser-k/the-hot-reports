# The Hot Reports - User Guide

This guide explains how to use the The Hot Reports content management system.

## Table of Contents
- [Logging In](#logging-in)
- [Editor Guide](#editor-guide)
  - [Managing Articles (Editor)](#managing-articles-editor)
  - [Managing Stories (Editor)](#managing-stories-editor)
  - [Managing Tourism Listings (Editor)](#managing-tourism-listings-editor)
  - [Approving Content](#approving-content)
  - [Managing Categories and Tags](#managing-categories-and-tags)
  - [Managing Push Notification Subscriptions](#managing-push-notification-subscriptions)
- [Reporter Guide](#reporter-guide)
  - [Creating Articles](#creating-articles)
  - [Submitting for Approval](#submitting-for-approval)
- [Story Writer Guide](#story-writer-guide)
  - [Creating Story Series](#creating-story-series)
  - [Adding Episodes](#adding-episodes)
- [Ads Manager Guide](#ads-manager-guide)
  - [Creating Tourism Listings](#creating-tourism-listings)

---

## Logging In

1. Go to the admin panel at `https://api.thehotreports.com/admin/` (the Lightsail API host).
2. Enter your email and password
3. Click "Login"

---

# Editor Guide

**Your Permissions:**
- Create, edit, and publish articles
- Create and manage story series and episodes
- Manage tourism listings
- Manage categories and tags
- Approve and publish content from other users
- Manage push notification subscriptions

---

## Managing Articles (Editor)

### Creating an Article

1. **Navigate to Articles**
   - Click on "News" in the admin sidebar
   - Click on "Articles"

2. **Add New Article**
   - Click the "Add Article" button

3. **Fill in Required Fields**

   **Basic Information:**
   - **Title**: The headline of your article (required)
     - *Format*: Clear, engaging headline
     - *Length*: 50-100 characters recommended
     - *Example*: "Uganda Sees Record Tourism Growth in 2026"
   
   - **Slug**: URL-friendly version of the title (auto-generated, read-only)
     - *Format*: Lowercase, hyphens instead of spaces
     - *Example*: "uganda-tourism-growth-2026"
     - *Note*: Auto-generated from title, cannot be edited
   
   - **Author**: Select any author from the dropdown
     - *Note*: You can assign articles to any registered user
   
   - **Category**: Choose the appropriate category (required)
     - *Options*: Politics, Business, Sports, Health, Education, Tourism, etc.
     - *Tip*: Select the most relevant category for your article
   
   - **Tags**: Add relevant tags (optional, comma-separated)
     - *Format*: Single words or short phrases
     - *Example*: "tourism, economy, development"
     - *Tip*: Use 3-5 relevant tags for better searchability

   **Content:**
   - **Summary**: Brief overview of the article (appears in cards and previews)
     - *Format*: 1-2 sentences
     - *Length*: 150-300 characters recommended
     - *Example*: "Uganda's tourism sector has experienced unprecedented growth this year, with visitor numbers up 45% compared to 2025."
     - *Tip*: Make it compelling to attract readers
   
   - **Content**: Full article body (supports rich text formatting)
     - *Format*: Use headings, paragraphs, and lists for readability
     - *Length*: 500-2000 words recommended
     - *Formatting*:
       - Use H2 for section headings
       - Use bullet points for lists
       - Use bold for emphasis
     - *Tip*: Write in a clear, journalistic style
   
   - **Featured Image**: Upload a main image for the article (recommended)
     - *Format*: JPG, PNG, or WEBP
     - *Size*: 1200x630px recommended (16:9 ratio)
     - *Max size*: 5MB
     - *Tip*: Use high-quality, relevant images
   
   - **Image Attribution** (optional): Photo credit for the featured image
     - *Format*: Text attribution like "Photo by John Smith" or license info
     - *Example*: "Tony Webster from Minneapolis, Minnesota, United States, CC BY 2.0, via Wikimedia Commons"
     - *Tip*: Always credit images you don't own

   **Publication Settings:**
   - **Status**: Choose from:
     - `Draft`: Saved but not published (use while writing)
     - `Pending`: Waiting for Editor approval (for Writers/Contributors)
     - `Published`: Live on the site (requires Editor permission)
   
   - **Highlight**: Mark as "Breaking News" if urgent (optional)
     - *Options*: None, Breaking News
     - *When to use*: For urgent, time-sensitive stories
     - *Tip*: Use sparingly for maximum impact
   
   - **Scheduled Publish At**: Set a future date/time to auto-publish (optional)
     - *Format*: Date picker and time selector
     - *Example*: Select date and time in the future
     - *Tip*: Useful for planned announcements

   **SEO Settings:**
   - **Meta Description**: Search engine description (optional)
     - *Format*: 1-2 sentences describing the article
     - *Length*: 150-160 characters ideal
     - *Example*: "Discover how Uganda's tourism sector achieved record growth in 2026 with insights from local business owners and tourism officials."
   
   - **Meta Keywords**: Search keywords (optional)
     - *Format*: Comma-separated keywords
     - *Example*: "tourism, Uganda, travel, safaris, economic growth"
     - *Tip*: Use 5-10 relevant keywords

4. **Save or Publish**
   - Click "Save" to save as draft
   - Click "Save and continue editing" to keep working
   - Click "Save and add another" to create another article

### Editing an Article

1. Go to "News" → "Articles"
2. Click on the article title you want to edit
3. Make your changes
4. Click "Save" to update

### Publishing an Article

- Change status to "Published" to make it live
- Set "Scheduled Publish At" for future auto-publishing
- Mark as "Breaking News" for urgent stories

### Deleting an Article

- You can delete any published article
- Drafts can also be deleted by their original creators

---

## Managing Stories (Editor)

Stories are serialized content like dramas, fiction series, or true-life tales published in episodes.

### Creating a Story Series

1. **Navigate to Stories**
   - Click on "News" in the admin sidebar
   - Click on "Story Series"

2. **Add New Series**
   - Click the "Add Story Series" button

3. **Fill in Required Fields**

   **Basic Information:**
   - **Title**: Name of the story series (required)
     - *Format*: Catchy, memorable series name
     - *Length*: 30-60 characters recommended
     - *Example*: "The Village Drama", "Campus Chronicles", "True Life Tales"
     - *Tip*: Choose a title that reflects the genre and tone
   
   - **Slug**: URL-friendly version (auto-generated)
     - *Format*: Lowercase, hyphens instead of spaces
     - *Example*: "the-village-drama", "campus-chronicles"
     - *Tip*: Keep it short and easy to remember
   
   - **Author**: Select any writer from the dropdown
     - *Note*: You can assign stories to any registered user
   
   - **Genre**: Choose the genre (Drama, Campus Life, True Life, Village, etc.)
     - *Options*:
       - Drama: Fictional dramatic stories
       - Campus Life: Stories set in universities/schools
       - True Life: Based on real events
       - Village: Rural life stories
       - Business: Business-themed stories
       - Romance: Love stories
     - *Tip*: Choose the most appropriate genre for your story
   
   - **Description**: Brief overview of the series
     - *Format*: 1-3 paragraphs describing the series
     - *Length*: 200-500 characters recommended
     - *Example*: "A gripping drama set in a small village in Uganda, following the lives of three families as they navigate love, betrayal, and redemption."
     - *Tip*: Hook readers with an intriguing summary

   **Cover Image:**
   - Upload a cover image for the series (recommended)
     - *Format*: JPG, PNG, or WEBP
     - *Size*: 1200x630px recommended (16:9 ratio)
     - *Max size*: 5MB
     - *Tip*: Use an image that represents the series theme
   
   - **Image Attribution** (optional): Photo credit for the cover image
     - *Format*: Text attribution like "Photo by John Smith"
     - *Example*: "Image by Jane Doe, CC BY-SA 4.0"

   **Publication Settings:**
   - **Status**: Draft, Pending, or Published
     - `Draft`: Saved but not published (use while planning)
     - `Pending`: Waiting for Editor approval
     - `Published`: Live on the site (requires Editor permission)
   
   - **Featured**: Mark as featured to highlight on the homepage
     - *When to use*: For new or highly popular series
     - *Tip*: Featured series get more visibility

4. **Save the Series**

### Adding Episodes to a Series

1. **Navigate to Episodes**
   - Click on "News" → "Story Episodes"

2. **Add New Episode**
   - Click the "Add Story Episode" button

3. **Fill in Required Fields**

   **Basic Information:**
   - **Series**: Select the parent series (required)
     - *Action*: Choose from dropdown of existing series
     - *Note*: You can only add episodes to series you created (or have permission for)
     - *Tip*: Ensure you select the correct series
   
   - **Title**: Episode title (required)
     - *Format*: Engaging title for this specific episode
     - *Length*: 30-60 characters recommended
     - *Example*: "Chapter 1: The Beginning", "The Unexpected Visitor"
     - *Tip*: Make it intriguing to encourage readers to continue
   
   - **Slug**: URL-friendly version (auto-generated)
     - *Format*: Lowercase, hyphens instead of spaces
     - *Example*: "chapter-1-the-beginning", "the-unexpected-visitor"
     - *Tip*: Keep it short and descriptive
   
   - **Episode Number**: Order in the series (required)
     - *Format*: Number (1, 2, 3, etc.)
     - *Example*: 1 for first episode, 2 for second, etc.
     - *Tip*: Use sequential numbers to maintain story flow
     - *Warning*: Changing episode numbers after publishing can confuse readers
   
   - **Content**: Full episode text
     - *Format*: Use paragraphs for readability
     - *Length*: 500-1500 words recommended
     - *Formatting*:
       - Use paragraphs for scene breaks
       - Use dialogue formatting for conversations
       - Keep paragraphs short for mobile reading
     - *Tip*: End with a cliffhanger to keep readers coming back

   **Images:**
   - Upload episode images (optional)
     - *Format*: JPG, PNG, or WEBP
     - *Size*: 1200x630px recommended (16:9 ratio)
     - *Max size*: 5MB each
     - *Tip*: Use images that illustrate key scenes
     - *Note*: You can upload multiple images
   
   - **Image Attribution** (optional): Photo credit for episode images
     - *Format*: Text attribution for each image used

   **Publication Settings:**
   - **Status**: Draft, Pending, or Published
     - `Draft`: Saved but not published (use while writing)
     - `Pending`: Waiting for Editor approval
     - `Published`: Live on the site (requires Editor permission)
   
   - **Scheduled Publish At**: Set future date/time for auto-publish
     - *Format*: Date picker and time selector
     - *Example*: Select date and time in the future
     - *Tip*: Schedule episodes to publish regularly (e.g., weekly)

4. **Save the Episode**

### Managing Episode Order

- Episode numbers determine the display order
- Use sequential numbers (1, 2, 3, etc.)
- Can reorder by changing episode numbers

### Publishing Stories

- **Editors**: Can publish series and episodes directly
- **Writers**: Submit series as "Pending" for approval
- Episodes inherit the series author permissions

---

## Managing Tourism Listings

Tourism listings showcase accommodations, safaris, and experiences in Uganda.

### Adding a Tourism Listing

1. **Navigate to Tourism**
   - Click on "News" → "Tourism Listings"

2. **Add New Listing**
   - Click the "Add Tourism Listing" button

3. **Fill in Required Fields**

   **Basic Information:**
   - **Name**: Business or attraction name (required)
     - *Format*: Official business name
     - *Length*: 20-100 characters recommended
     - *Example*: "Uganda Safari Lodge", "Lake Bunyonyi Resort"
     - *Tip*: Use the official, recognizable name
   
   - **Slug**: URL-friendly version (auto-generated)
     - *Format*: Lowercase, hyphens instead of spaces
     - *Example*: "queen-elizabeth-safari-lodge", "lake-bunyonyi-resort"
     - *Tip*: Keep it short and easy to remember
   
   - **Type**: Safari, Lodge, Hotel, Campsite, or Experience (required)
     - *Options*:
       - Safari: Wildlife viewing and game drives
       - Lodge: Accommodation with facilities
       - Hotel: Standard hotel accommodation
       - Campsite: Camping grounds
       - Experience: Activities and tours
     - *Tip*: Choose the most accurate category
   
   - **Location**: Town/area in Uganda (required)
     - *Format*: Town name or area description
     - *Example*: "Kabale Town", "Lake Bunyonyi", "Bwindi Impenetrable Forest"
     - *Tip*: Be specific to help visitors find it
   
   - **Description**: Detailed description (required)
     - *Format*: 2-4 paragraphs describing the offering
     - *Length*: 300-800 characters recommended
     - *Example*: "Nestled on the shores of Lake Bunyonyi, our eco-lodge offers stunning views and comfortable accommodation. Enjoy bird watching, boat rides, and local cuisine. Perfect for nature lovers and those seeking tranquility."
     - *Tip*: Highlight unique features and attractions
   
   - **Featured Image**: Upload an image (recommended)
     - *Format*: JPG, PNG, or WEBP
     - *Size*: 1200x630px recommended (16:9 ratio)
     - *Max size*: 5MB
     - *Tip*: Use high-quality photos of the actual location

   **Creator Tracking:**
   - **Created By**: Automatically set to the user who created the listing
     - *Note*: This field is auto-populated and read-only
     - *Visible to*: Editors can see who created each listing

   **Contact Information:**
   - **Phone**: Contact phone number
     - *Format*: International format: +256 XXX XXX XXX
     - *Example*: +256 704 123 456
     - *Tip*: Include country code for international visitors
   
   - **Email**: Contact email
     - *Format*: Valid email address
     - *Example*: info@examplelodge.com
     - *Tip*: Use a business email, not personal
   
   - **Website**: Business website URL
     - *Format*: Full URL including https://
     - *Example*: https://www.examplelodge.com
     - *Tip*: Test the link before saving
   
   - **Social Media**: Social media links
     - *Format*: Full URLs for Facebook, Instagram, Twitter, etc.
     - *Example*: https://facebook.com/examplelodge
     - *Tip*: Add all active social media accounts

   **Details:**
   - **Price Range**: Budget, Mid-range, or Luxury
     - *Options*:
       - Budget: Affordable options
       - Mid-range: Moderate pricing
       - Luxury: Premium pricing
     - *Tip*: Be honest about pricing to manage expectations
   
   - **Amenities**: List available amenities
     - *Format*: Comma-separated list
     - *Example*: "WiFi, Restaurant, Bar, Swimming Pool, Parking"
     - *Tip*: List all available amenities to attract visitors
   
   - **Rating**: Star rating (1-5)
     - *Format*: Number from 1 to 5
     - *Example*: 4 for 4-star rating
     - *Tip*: Base on actual quality and services

   **Publication Settings:**
   - **Status**: Draft, Pending, or Published
     - `Draft`: Saved but not published (use while compiling information)
     - `Pending`: Waiting for Editor approval
     - `Published`: Live on the site (requires Editor permission)
   
   - **Featured**: Mark as featured to highlight
     - *When to use*: For highly recommended or unique offerings
     - *Tip*: Featured listings get more visibility

4. **Save the Listing**

---

## Managing Categories and Tags

### Creating a Category

1. Go to "News" → "Categories"
2. Click "Add Category"
3. **Fill in:**
   - **Name**: Category name (e.g., Politics, Sports, Health)
     - *Format*: Single word or short phrase
     - *Length*: 10-30 characters recommended
     - *Example*: "Politics", "Business", "Health", "Tourism"
     - *Tip*: Use broad, recognizable categories
   
   - **Slug**: URL-friendly version (auto-generated, read-only)
     - *Format*: Lowercase, hyphens instead of spaces
     - *Example*: "politics", "business", "tourism"
     - *Note*: Auto-generated from name, cannot be edited
   
   - **Description**: Brief description
     - *Format*: 1-2 sentences explaining the category
     - *Length*: 100-200 characters recommended
     - *Example*: "News and updates about political developments in Uganda"
     - *Tip*: Help users understand what content belongs here
   
   - **Order**: Display order in navigation
     - *Format*: Number (1, 2, 3, etc.)
     - *Example*: 1 for most important, higher numbers for less important
     - *Tip*: Lower numbers appear first in menus
4. Click "Save"

### Creating a Tag

1. Go to "News" → "Tags"
2. Click "Add Tag"
3. **Fill in:**
   - **Name**: Tag name (e.g., Election, Tourism, Education)
     - *Format*: Single word or short phrase
     - *Length*: 5-20 characters recommended
     - *Example*: "election", "tourism", "education", "infrastructure"
     - *Tip*: Use specific, searchable terms
   
   - **Slug**: URL-friendly version (auto-generated, read-only)
     - *Format*: Lowercase, hyphens instead of spaces
     - *Example*: "election", "tourism", "education"
     - *Note*: Auto-generated from name, cannot be edited
4. Click "Save"

---

## Approving Content

### Reviewing Pending Articles

**Method 1: Individual Approval**

1. Go to "News" → "Articles"
2. Filter by Status: "Pending"
3. Click on an article to review
4. Review the content and make edits if needed
5. Change status to "Published" to approve
6. Click "Save"

**Method 2: Bulk Approval (Multiple Articles)**

1. Go to "News" → "Articles"
2. Filter by Status: "Pending" (optional)
3. Check the boxes next to articles you want to approve
4. From the "Action" dropdown at the top, select **"Approve and publish selected articles"**
5. Click "Run"
6. All selected articles will be published with proper approval metadata

**Note:** Both methods now set the same approval metadata (approved_by, approved_at, published_at) automatically.

### Reviewing Pending Stories

1. Go to "News" → "Story Series" or "Story Episodes"
2. Filter by Status: "Pending"
3. Review and publish as needed

### Reviewing Pending Tourism Listings

1. Go to "News" → "Tourism Listings"
2. Filter by Status: "Pending"
3. Review and publish as needed

---

## Managing Push Notification Subscriptions

Editors can view and manage browser push notification subscriptions.

### Viewing Subscriptions

1. Go to "News" → "Push subscriptions"
2. See list of all subscribers with:
   - **Endpoint**: Browser subscription URL (preview)
   - **Is Active**: Whether subscription is active
   - **Notification Count**: Number of notifications sent
   - **Subscribed At**: When user subscribed
   - **Last Used**: Last activity timestamp

### Managing Subscriptions

**Mark as Active/Inactive:**
1. Check the boxes next to subscriptions
2. Select "Mark selected subscriptions as active" or "Mark selected subscriptions as inactive" from the Action dropdown
3. Click "Run"

**Search:**
- Use the search box to find subscriptions by endpoint or user agent

---

# Reporter Guide

**Your Permissions:**
- Create and edit your own articles only
- **Author is automatically set to you** (field is hidden)
- Can only save as **Draft** (cannot publish directly)
- Must submit articles for Editor approval
- Cannot edit pending or published articles

---

## Creating Articles

### Step 1: Navigate to Articles
- Click on "News" in the admin sidebar
- Click on "Articles"

### Step 2: Add New Article
- Click the "Add Article" button

### Step 3: Fill in Required Fields

**Basic Information:**
- **Title**: The headline of your article (required)
  - *Format*: Clear, engaging headline
  - *Length*: 50-100 characters recommended
  - *Example*: "Uganda Sees Record Tourism Growth in 2026"

- **Slug**: URL-friendly version (auto-generated, read-only)
  - *Format*: Lowercase, hyphens instead of spaces
  - *Example*: "uganda-tourism-growth-2026"

- **Category**: Choose the appropriate category (required)
  - *Options*: Politics, Business, Sports, Health, Education, Tourism, etc.

- **Tags**: Add relevant tags (optional, comma-separated)
  - *Example*: "tourism, economy, development"
  - *Tip*: Use 3-5 relevant tags

**Content:**
- **Summary**: Brief overview (150-300 characters)
  - *Example*: "Uganda's tourism sector has experienced unprecedented growth this year."

- **Content**: Full article body (500-2000 words)
  - *Tip*: Use H2 for headings, bullet points for lists

- **Featured Image**: Upload a main image (1200x630px recommended)

- **Image Attribution** (optional): Photo credit
  - *Example*: "Photo by John Smith, CC BY 2.0"

**Publication Settings:**
- **Status**: You can only save as `Draft`
  - *Note*: Editors must approve before publishing

- **Scheduled Publish At**: You cannot set this (Editors only)

- **Highlight**: You cannot set this (Editors only)

### Step 4: Save
- Click "Save" to save as draft
- Your article is now ready to submit for approval

---

## Submitting for Approval

### Submit a Draft Article

1. Go to "News" → "Articles"
2. Find your draft article
3. Click on the article title
4. Review your content one last time
5. Click "Save and continue editing"
6. **Notify your Editor** that your article is ready for review

### What Happens Next

- Editor reviews your article
- Editor may make edits or request changes
- Editor will publish when ready
- You cannot edit the article once it's "Pending" or "Published"

---

# Story Writer Guide

**Your Permissions:**
- Create and manage your own story series and episodes
- **Author is automatically set to you** (field is hidden)
- Can only save as **Draft** (cannot publish directly)
- Must submit content for Editor approval
- Cannot edit pending or published content

---

## Creating Story Series

### Step 1: Navigate to Stories
- Click on "News" in the admin sidebar
- Click on "Story Series"

### Step 2: Add New Series
- Click the "Add Story Series" button

### Step 3: Fill in Required Fields

**Basic Information:**
- **Title**: Name of the story series (required)
  - *Example*: "The Village Drama", "Campus Chronicles"

- **Slug**: URL-friendly version (auto-generated)

- **Genre**: Choose the genre
  - *Options*: Drama, Campus Life, True Life, Village, Business, Romance

- **Description**: Brief overview (200-500 characters)
  - *Example*: "A gripping drama set in a small village in Uganda..."

**Cover Image:**
- Upload a cover image (1200x630px recommended)

- **Image Attribution** (optional): Photo credit

**Publication Settings:**
- **Status**: You can only save as `Draft`

- **Featured**: You cannot set this (Editors only)

### Step 4: Save
- Click "Save" to save as draft

---

## Adding Episodes

### Step 1: Navigate to Episodes
- Click on "News" → "Story Episodes"

### Step 2: Add New Episode
- Click the "Add Story Episode" button

### Step 3: Fill in Required Fields

**Basic Information:**
- **Series**: Select your parent series (required)
  - *Note*: You can only add episodes to series you created

- **Title**: Episode title (required)
  - *Example*: "Chapter 1: The Beginning"

- **Slug**: URL-friendly version (auto-generated)

- **Episode Number**: Order in series (1, 2, 3, etc.)

- **Content**: Full episode text (500-1500 words)

**Images:**
- Upload episode images (optional)

- **Image Attribution** (optional): Photo credit

**Publication Settings:**
- **Status**: You can only save as `Draft`

- **Scheduled Publish At**: You cannot set this (Editors only)

### Step 4: Save
- Click "Save" to save as draft
- Notify your Editor when episodes are ready for review

---

# Ads Manager Guide

**Your Permissions:**
- Create and manage tourism listings
- **Created by is automatically tracked** (field is auto-set)
- Can only save listings as **Draft** (cannot publish directly)
- Cannot publish listings directly (requires Editor approval)

---

## Creating Tourism Listings

### Step 1: Navigate to Tourism
- Click on "News" in the admin sidebar
- Click on "Tourism Listings"

### Step 2: Add New Listing
- Click the "Add Tourism Listing" button

### Step 3: Fill in Required Fields

**Basic Information:**
- **Name**: Business or attraction name (required)
  - *Example*: "Uganda Safari Lodge", "Lake Bunyonyi Resort"

- **Slug**: URL-friendly version (auto-generated)

- **Type**: Safari, Lodge, Hotel, Campsite, or Experience (required)

- **Location**: Town/area in Uganda (required)
  - *Example*: "Kabale Town", "Lake Bunyonyi"

- **Description**: Detailed description (300-800 characters)

- **Featured Image**: Upload an image (1200x630px recommended)

- **Image Attribution** (optional): Photo credit

**Contact Information:**
- **Phone**: +256 XXX XXX XXX
- **Email**: Valid email address
- **Website**: Full URL including https://
- **Social Media**: Full URLs for social accounts

**Details:**
- **Price Range**: Budget, Mid-range, or Luxury
- **Amenities**: Comma-separated list
  - *Example*: "WiFi, Restaurant, Bar, Swimming Pool"
- **Rating**: Star rating (1-5)

**Publication Settings:**
- **Status**: You can only save as `Draft`

- **Featured**: You cannot set this (Editors only)

### Step 4: Save
- Click "Save" to save as draft
- Notify your Editor that the listing is ready for review

---

## Best Practices

### Articles
- **Titles**: Keep them clear and engaging (50-100 characters)
- **Summary**: Write compelling summaries for social sharing
- **Images**: Use high-quality, relevant images (recommended size: 1200x630px)
- **Content**: Use proper formatting (headings, paragraphs, lists)
- **SEO**: Include relevant keywords in titles and descriptions

### Stories
- **Series**: Create a clear series description to attract readers
- **Episodes**: Maintain consistent tone and style across episodes
- **Episode Length**: Keep episodes at a readable length (500-1500 words)
- **Cover Images**: Use engaging visuals for series covers
- **Scheduling**: Publish episodes regularly to maintain reader interest

### Tourism Listings
- **Accuracy**: Ensure all contact information is current
- **Images**: Show actual photos of the location/service
- **Descriptions**: Be detailed and honest about offerings
- **Pricing**: Keep price ranges up to date

---

## Troubleshooting

### Cannot Publish Content
- **Writers/Contributors**: Submit content as "Pending" for Editor approval
- **Editors**: Check if you have the correct permissions

### Images Not Uploading
- Ensure image file size is under 5MB
- Use supported formats: JPG, PNG, WEBP
- Check your internet connection

### Content Not Appearing on Site
- Check if status is "Published" (not Draft or Pending)
- Verify the publication date is not in the future
- Clear browser cache and refresh

### Scheduled Content Not Publishing
- Ensure the Cron Job is running on the server
- Check the scheduled publish date/time is correct
- Verify server timezone is set correctly

---

## Getting Help

For technical issues or questions:
- Contact the site administrator
- Email: info@thehotreports.com

---

## Quick Reference

| Content Type | Required Fields | Can Schedule | Can Feature | Auto-Set Author |
|-------------|----------------|--------------|-------------|---------------|
| Article | Title, Category, Content | ✅ | ✅ | Reporters |
| Story Series | Title, Genre | ❌ | ✅ | Storywriters |
| Story Episode | Series, Title, Episode Number, Content | ✅ | ❌ | Storywriters |
| Tourism Listing | Name, Type, Location, Description | ❌ | ✅ | Ads Managers (as Created By) |

---
