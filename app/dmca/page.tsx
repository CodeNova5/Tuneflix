// components/DMCAPolicy.js
import React from "react";

const DMCAPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-white bg-gray-900 rounded-2xl shadow-lg mt-10 space-y-6">
      <h1 className="text-4xl font-bold text-center text-blue-400">DMCA Policy</h1>

      <p>
        Tuneflix respects the intellectual property rights of others and expects users of our website to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond promptly to claims of copyright infringement committed using the Tuneflix service and/or the Tuneflix website.
      </p>

      <h2 className="text-2xl font-semibold text-blue-300">Filing a DMCA Complaint</h2>
      <p>
        If you are a copyright owner or an agent thereof and believe that any content hosted on our site infringes your copyrights, you may submit a written notification pursuant to the DMCA by providing the following information:
      </p>
      <ul className="list-disc list-inside pl-4 space-y-1">
        <li>Your physical or electronic signature.</li>
        <li>Identification of the copyrighted work claimed to have been infringed.</li>
        <li>Identification of the material that is claimed to be infringing and that is to be removed, with sufficient information to allow us to locate the material.</li>
        <li>Your contact information (address, telephone number, and email address).</li>
        <li>A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
        <li>A statement, made under penalty of perjury, that the above information is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-blue-300">Where to Send the Complaint</h2>
      <p>
        Please send the DMCA notice to our designated agent at:
        <br />
        <strong>Email:</strong> codenova02@gmail.com
        <br />
        <strong>Subject:</strong> DMCA Takedown Notice
      </p>

      <h2 className="text-2xl font-semibold text-blue-300">Counter-Notification</h2>
      <p>
        If you believe your content was removed or disabled as a result of mistake or misidentification, you may submit a counter-notification with the following information:
      </p>
      <ul className="list-disc list-inside pl-4 space-y-1">
        <li>Your physical or electronic signature.</li>
        <li>Identification of the content that has been removed or to which access has been disabled, and the location where the content appeared before it was removed or disabled.</li>
        <li>A statement under penalty of perjury that you have a good faith belief that the content was removed or disabled as a result of mistake or misidentification.</li>
        <li>Your name, address, telephone number, and email address.</li>
        <li>A statement that you consent to the jurisdiction of the federal court in your district and that you will accept service of process from the person who provided the original DMCA notice.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-blue-300">Repeat Infringers</h2>
      <p>
        Tuneflix reserves the right to terminate the accounts of users who are repeat infringers of intellectual property rights.
      </p>

      <h2 className="text-2xl font-semibold text-blue-300">Changes to This Policy</h2>
      <p>
        We may update this DMCA policy from time to time. Any changes will be posted on this page.
      </p>
    </div>
  );
};

export default DMCAPolicy;
