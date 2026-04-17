import axios from 'axios';

/**
 * Send OTP via SMS India Hub
 * @param {string} mobile - 10-digit mobile number
 * @param {string} otp - The 6 digit OTP to send
 * @returns {Promise<boolean>} - Returns true if message sent successfully
 */
export const sendOTP = async (mobile, otp) => {
    const apiKey = process.env.SMSINDIAHUB_API_KEY;
    const senderId = process.env.SMSINDIAHUB_SENDER_ID;
    const isOtpEnabled = process.env.OTP_ENABLED === 'true';

    // If OTP is disabled or credentials missing, just log/simulated send
    if (!isOtpEnabled || !apiKey || !senderId) {
        console.warn('SMS Sending is DISABLED or credentials missing. Check .env if this is wrong.');
        console.log(`[SIMULATED SMS] To: ${mobile}, OTP: ${otp}`);
        return true;
    }

    try {
        // Template: Welcome to the NowStay powered by SMSINDIAHUB. Your OTP for registration is ${otp}
        const message = `Welcome to the NowStay powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;

        // Official Transactional API URL
        const url = `http://cloud.smsindiahub.in/vendorsms/pushsms.aspx`;

        // Ensure mobile has 91 prefix
        const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;

        const response = await axios.get(url, {
            params: {
                user: apiKey,
                password: apiKey, // Using apiKey as fallback for both or just apiKey if param is correct
                APIKey: apiKey,
                msisdn: formattedMobile,
                msg: message,
                sid: senderId,
                fl: 0,
                gwid: 2
            }
        });

        console.log(`Sending SMS to ${formattedMobile} [Using Combined Auth]...`);
        console.log('SMS India Hub response:', response.data);
        return true;
    } catch (error) {
        console.error('Failed to send SMS via India Hub:', error.message);
        return false;
    }
};
