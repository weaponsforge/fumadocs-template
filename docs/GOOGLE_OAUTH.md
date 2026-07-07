## Google OAuth Setup for Sign-in

### Requirements

- Google Account

### Steps

1. Sign-in to your Google account via Gmail.

2. Go to the Google Cloud Console page at https://console.cloud.google.com/

3. Create a new Google Cloud project (upper left button)

4. Follow the prompts when creating a new project.
   - **Project name**: _(your project name)_
   - **Parent resource**: _(leave to default)_

5. Select the newly-created project.

6. Go to **Quick Access** ➝ **APIs & Services** ➝ **OAuth consent screen**.
   - Click the **Get started** button. Fill in the following information:
   - **App Information**
      ```text
      App name: (your app name)
      User support email: (your signed-in Google email)
      ```
   - **Audience**: _(select **External**)_
   - **Contact Information**: _(your email/s for contact)_
      > 💡 **INFO**: You could use other emails other than your signed-in email
   - Click the **Finish** button.
   - Click the **Create** button.

7. Go to https://console.cloud.google.com/. Select your project. Then **Quick Access** ➝ **APIs & Services** ➝ **Credentials**.
  - Click the **+ Create credentials** button
  - Select **OAuth client ID**
  - Select the following when prompted:
     ```text
     Application type: Web application
     Name: (your web app name)
     ```
  - **Authorized JavaScript origins**: Add the domain origins of websites you control in which you'll use this Google Oauth
  - **Authorized redirect URIs**: Add the following
     ```text
     https://<YOUR_DEPLOYED_APP_ROOT_DOMAIN>/api/auth/callback/google
     eg., http://localhost:3000/api/auth/callback/google
          (when working in local development)
     ```
  - Click the **Create** button.

      > 💡 **NOTE**<br>
      > Take note of the **Client ID** and **Client secret** that will be displayed

<br>

> [!IMPORTANT]
> Assign the following values to the environment variables.
>
> `GOOGLE_CLIENT_ID` - generated **Client ID**<br>
> `GOOGLE_CLIENT_SECRET` - generated **Client secret**
