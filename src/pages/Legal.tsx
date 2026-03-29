import AdSlot from "../components/AdSlot";

export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black mb-12">Legal Information</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Terms of Service</h2>
        <div className="prose prose-orange max-w-none text-gray-600 space-y-4">
          <p>By using QuickMeet, you agree to the following terms:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 18 years of age to use this service.</li>
            <li>You will not use the service for any illegal activities.</li>
            <li>You will not harass, abuse, or threaten other users.</li>
            <li>You will not share sexually explicit content.</li>
            <li>We reserve the right to ban users who violate these terms.</li>
          </ul>
          <p>QuickMeet is provided "as is" without any warranties. We are not responsible for the behavior of users on the platform.</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Privacy Policy</h2>
        <div className="prose prose-orange max-w-none text-gray-600 space-y-4">
          <p>Your privacy is important to us. Here is how we handle your data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We do not store chat logs or video streams on our servers.</li>
            <li>We use temporary session data to match you with strangers.</li>
            <li>We use cookies to store your preferences (like interests).</li>
            <li>Third-party advertisers (like Google AdSense) may use cookies to serve ads.</li>
            <li>We do not sell your personal information to third parties.</li>
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Community Guidelines</h2>
        <p className="text-gray-600 mb-4">Help us keep QuickMeet a fun and safe place for everyone:</p>
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <ul className="space-y-3 text-sm font-medium text-orange-800">
            <li>✅ Be kind and respectful</li>
            <li>✅ Keep it clean</li>
            <li>✅ Report bad behavior</li>
            <li>❌ No spamming</li>
            <li>❌ No sharing personal contact info</li>
          </ul>
        </div>
      </section>

      <div className="mt-16">
        <AdSlot slotId="LEGAL_PAGE_BOTTOM" />
      </div>
    </div>
  );
}
