const STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
}

const DB_MODEL_REF_NEW = {
    USERS: 'test_user',
    MASTERs: 'test_master_setting',
    ITEMS: 'test_item',
    SLAB: 'test_slab',
    ESTIMATE: 'test_estimate',
    STATE:'test_state',
}
const LOOKUP_REF_NEW = {
    USERS: 'test_users',
    MASTERs: 'test_master_settings',
    ITEMS: 'test_items',
    SLAB: 'test_slabs',
    ESTIMATE: 'test_estimates',
    STATE:'test_states',

}
const http_code = {
    created: 201,
    ok: 200,
    unAuthorized: 401,
    account_not_found: 302,
    dataNotFound: 404,
    forbidden: 403,
    badRequest: 400,
    internalServerError: 500,
    anotherDevice: 208
}

const ACCOUNT_LEVEL = {
    SALES: 1,
    CUSTOMER: 2
};
const ACCOUNT_TYPE = {
    SALES: "SALES",
    CUSTOMER: "CUSTOMER",
    ADMIN:'ADMIN',
}

const MESSAGES = {
    tokenCantEmpty:'User device token cant be empty.',
    passCantEmpty: "Password can't be empty",
    invalidPassword: 'Please enter valid Password. ex.Test@123',
    userNotFound: "User not found.",
    passwordMismatch: "Password is incorrect.",
    invalidToken: "Invalid access token.",
    unAuthAccess: "Unauthorized access ",
    userAlreadyExist: 'User is already exist with the same customer id or phone number.',
    userAlreadyPhoneExist:'User is already exist with the same phone number.',
    onlySalescanCreate: 'Only SALEs user can create / edit.',
    onlyAdmincanCreate:'Only Admin user can create / edit.',
    issuewithMSGSend:'There is some issue with MSG send.',
    InternalServerError: "Internal server error.",
    dataNotFound: "Data not found.",
    itemNotFound: "Item not found.",
    slabNotFound: "Slab not found.",
    estimateNotFound: "Estimate not found.",
    issueWithRefreshToken: 'There is some issue with refresh Token.',
    issueWithAccessToken: 'There is some issue with access Token.',
    issueWithZohoCode: 'There is some issue with ZOHO Token.',
    logoutSuccessfully: "Signout Successfully.",
    emailSended: "Check your mail to reset your password.",
    PasswordUpdateSuccess: "Password changed successfully",
    alreadyRegisteredWithSocial: 'You already registered with social media.',
    userIdRequired: 'User id is required.',
    emptyId: 'Please enter id.',
    invalidId: 'Please enter valid id.',
    issueWithlist: 'There is some issue with list.',
    stateEmpty: 'User state required.',
    statusTrue: true,
    statusFalse: false,
}

const APPROVALSTATUS = {
    APPROVE: 'Approved',
    REJECT: 'Rejected',
    PENDING: 'Pending',
};

const PRFSTATUS = {
    APPROVE: 'Approved',
    REJECT: 'Rejected',
    PENDING: 'Pending',
    DISPATCH: 'Dispatched',
};


module.exports = Object.freeze({
    http_code,
    TOKEN_EXPIRATION_TIME: 24 * 60, // in mins - 60
    STATUS,
    ACCOUNT_LEVEL,
    DB_MODEL_REF_NEW,
    LOOKUP_REF_NEW,
    ACCOUNT_TYPE,
    MESSAGES,
    APPROVALSTATUS,
    PRFSTATUS
});