const { google } = require('googleapis')

/* =========================================================
   Environment Helpers
========================================================= */

const requiredEnv = (key) => {
    const value = process.env[key]

    if (!value) {
        throw new Error(
            `Missing environment variable: ${key}`
        )
    }

    return value
}

const normalizePrivateKey = (key) =>
    key.includes('\\n') ?
    key.replace(/\\n/g, '\n') :
    key

/* =========================================================
   Validators
========================================================= */

const isEmail = (value = '') =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value.trim()
    )

const isGlBajajEmail = (value = '') =>
    isEmail(value) &&
    value
    .trim()
    .toLowerCase()
    .endsWith('@glbajajgroup.org')

const isPhoneish = (value = '') =>
    /^\d{10}$/.test(value.trim())

/* =========================================================
   JSON Parser
========================================================= */

async function readJson(req) {
    if (
        req.body &&
        typeof req.body === 'object'
    ) {
        return req.body
    }

    const raw = await new Promise(
        (resolve, reject) => {
            let data = ''

            req.on('data', chunk => {
                data += chunk
            })

            req.on('end', () =>
                resolve(data)
            )

            req.on('error', reject)
        }
    )

    if (!raw) return {}

    try {
        return JSON.parse(raw)
    } catch {
        return {}
    }
}

/* =========================================================
   Google Sheets Service
========================================================= */

async function appendToSheet(payload) {
    const auth = new google.auth.JWT({
        email: requiredEnv(
            'GOOGLE_SERVICE_ACCOUNT_EMAIL'
        ),

        key: normalizePrivateKey(
            requiredEnv(
                'GOOGLE_PRIVATE_KEY'
            )
        ),

        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    })

    const sheets = google.sheets({
        version: 'v4',
        auth,
    })

    const spreadsheetId = requiredEnv(
        'GOOGLE_SHEET_ID'
    )

    const sheetName =
        process.env.GOOGLE_SHEET_TAB_NAME ||
        'Responses'

    const interests = Array.isArray(
            payload.interests
        ) ?
        payload.interests.join(', ') :
        ''

    const declarations = Array.isArray(
            payload.declarationSelected
        ) ?
        payload.declarationSelected.join(
            ', '
        ) :
        payload.declaration || ''

    const row = [
        new Date().toISOString(),
        payload.fullName || '',
        payload.collegeEmail || '',
        payload.whatsapp || '',
        payload.year || '',
        payload.branch || '',
        payload.section || '',
        payload.role || '',
        interests,
        payload.skills || '',
        payload.comms || '',
        payload.campusExp || '',
        payload.campusExpDetails || '',
        payload.links || '',
        payload.commitHours || '',
        payload.attendCampus || '',
        payload.assessmentOk || '',
        payload.whyJoin || '',
        payload.anythingElse || '',
        declarations,
        payload.submittedAt || '',
        payload.userAgent || '',
    ]

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',

        requestBody: {
            values: [row],
        },
    })
}

/* =========================================================
   Request Validation
========================================================= */

function validatePayload(body) {
    const requiredFields = [
        'fullName',
        'collegeEmail',
        'whatsapp',
        'year',
        'branch',
        'section',
        'role',
        'skills',
        'comms',
        'campusExp',
        'commitHours',
        'attendCampus',
        'assessmentOk',
        'whyJoin',
        'declaration',
    ]

    const hasNewDeclaration =
        body ? .declarationAccepted !==
        undefined

    const missingFields =
        requiredFields.filter(
            field =>
            !String(
                body[field] || ''
            ).trim()
        )

    if (!hasNewDeclaration &&
        missingFields.length
    ) {
        return `Missing required field(s): ${missingFields.join(
            ', '
        )}`
    }

    if (!isGlBajajEmail(
            body.collegeEmail
        )) {
        return 'Email must end with @glbajajgroup.org.'
    }

    if (!isPhoneish(body.whatsapp)) {
        return 'Invalid contact number (10 digits required).'
    }

    if (hasNewDeclaration) {
        if (!body.declarationAccepted ||
            (
                Array.isArray(
                    body.declarationSelected
                ) &&
                body.declarationSelected.includes(
                    'disagree'
                )
            )
        ) {
            return 'Declaration not accepted.'
        }
    } else if (
        body.declaration ===
        'I do not agree to the above declaration.'
    ) {
        return 'Declaration not accepted.'
    }

    return null
}

/* =========================================================
   Main API Handler
========================================================= */

module.exports = async(
    req,
    res
) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                error: 'Method not allowed',
            })
        }

        const body = await readJson(req)

        const validationError =
            validatePayload(body)

        if (validationError) {
            return res.status(400).json({
                error: validationError,
            })
        }

        await appendToSheet(body)

        return res.status(200).json({
            ok: true,
            message: 'Response submitted successfully',
        })

    } catch (error) {
        return res.status(500).json({
            error: error ? .message ||
                'Internal server error',
        })
    }
}