const Constants = {
    logEventActions: {
        0: "Participant status",
        1: "Participant comment", // not used anymore
        2: "Email sent",
        3: "Email status",
        4: "Email is assigned on a QA-er",
        5: "Message status",
        6: "Message is assigned on a QA-er",
        7: "Attachment status",
        8: "Attachment is assigned on a QA-er",
        9: "Attachment is redacted",
        10: "Rework is done",
        11: "Removing redacted attachment"
    },
    qaToolTypes: {
        'emails': {
            name: 'Emails',
            name2: 'Emails',
            name3: 'Email',
            navbarName: 'QA emails',
            prefix: 'e_',
            assetCategory: 'email',
            urlTag: 'email',
            assetExtension: 'html',
            pptStatuses: 'emailStatuses',
            root: '/emails',
            rootLabels: '/emailLabels',
            statusChangeAction: 3,
            qaerAssignedAction: 4,
            messageLogKey: 'e',
            clientOrder: '1',
            statuses: {
                0: "New",
                1: "Accepted",
                2: "Rejected",
                3: "Backup",
                4: "Delivered",
                5: "Accepted by client",
                6: "Rejected by client"
            },
            failReasons: {
                1: "Duplicate",
                2: "In foreign language",
                3: "Irrelevant",
                4: "No date",
                5: "Incorrect format",
                6: "Older than 2 years",
                7: "Other",
                8: "Incorrect locale"
            }
        },
        'textMessages': {
            name: 'Text messages',
            name2: 'Text',
            name3: 'Text message',
            navbarName: 'QA text',
            prefix: 't_',
            assetCategory: 'text_message',
            urlTag: 'message',
            assetExtension: 'txt',
            pptStatuses: 'textMessageStatuses',
            root: '/textMessages',
            rootLabels: '/textMessageLabels',
            statusChangeAction: 5,
            qaerAssignedAction: 6,
            messageLogKey: 'm',
            clientOrder: '3',
            statuses: {
                0: "New",
                1: "Accepted",
                2: "Rejected",
                3: "Backup",
                4: "Delivered",
                5: "Accepted by client",
                6: "Rejected by client"
            },
            failReasons: {
                1: "Duplicate",
                2: "In foreign language",
                3: "Irrelevant",
                4: "No date",
                5: "Not fully visible",
                6: "Incorrect format",
                7: "Older than 2 years",
                8: "Other",
                9: "Incorrect locale"
            }
        },
        'attachments': {
            name: 'Attachments',
            name2: 'Att.',
            name3: 'Attachment',
            navbarName: 'QA attachments',
            prefix: 'a_',
            assetCategory: 'attachment',
            urlTag: 'attachment',
            // assetExtension: 'pdf', // this is not used, because it's dynamic for the attachments
            pptStatuses: 'attachmentStatuses',
            root: '/attachments',
            rootLabels: '/attachmentLabels',
            statusChangeAction: 7,
            qaerAssignedAction: 8,
            messageLogKey: 'at',
            clientOrder: '2',
            statuses: {
                0: "New",
                1: "Accepted",
                2: "Rejected",
                3: "Backup",
                4: "Delivered",
                5: "Accepted by client",
                6: "Rejected by client"
            },
            failReasons: {
                1: "Duplicate",
                2: "In foreign language",
                3: "Irrelevant",
                4: "No date",
                5: "Incorrect format",
                6: "Older than 2 years",
                7: "Other",
                8: "Incorrect locale"
            }
        },
    },
    emailTypes: {
        0: "Handoff",
        1: "Handoff reminder",
        2: "Review",
        3: "Review reminder",
        4: "Final reminder"
    },
    qaToolFilterItemsToShow: [
        10,
        50,
        100,
        500,
        1000,
        2000,
        5000,
        10000,
        20000,
        30000
    ],
    logLimiter: [
        200,
        500,
        1000,
        5000
    ],
    participantStatuses: {
        0: "",
        1: "Handoff sent",
        2: "Handoff reminder sent",
        // 3: "Review sent",
        // 4: "Review reminder sent",
        // 5: "Final reminder sent",
        6: "Completed",
        //7: "Duplicate",
        8: "Rejected",
        9: "Withdrawn",
        10: "Not selected"
    },
    piiLabels: [
        {
            typeId: 1,
            internal: 'First name person 1',
            external: 'first_name_person_1',
            hotkey: '1'
        },
        {
            typeId: 2,
            internal: 'Last name person 1',
            external: 'last_name_person_1',
            hotkey: '2'
        },
        {
            typeId: 26,
            internal: 'First name person 2',
            external: 'first_name_person_2',
            hotkey: '',
        },
        {
            typeId: 27,
            internal: 'Last name person 2',
            external: 'last_name_person_2',
            hotkey: '',
        },
        {
            typeId: 28,
            internal: 'First name person 3',
            external: 'first_name_person_3',
            hotkey: '',
        },
        {
            typeId: 29,
            internal: 'Last name person 3',
            external: 'last_name_person_3',
            hotkey: '',
        },
        {
            typeId: 30,
            internal: 'First name person 4',
            external: 'first_name_person_4',
            hotkey: '',
        },
        {
            typeId: 31,
            internal: 'Last name person 4',
            external: 'last_name_person_4',
            hotkey: '',
        },
        {
            typeId: 32,
            internal: 'First name person 5',
            external: 'first_name_person_5',
            hotkey: '',
        },
        {
            typeId: 33,
            internal: 'Last name person 5',
            external: 'last_name_person_5',
            hotkey: '',
        },
        {
            typeId: 40,
            internal: 'First name person 6',
            external: 'first_name_person_6',
            hotkey: '',
        },
        {
            typeId: 41,
            internal: 'Last name person 6',
            external: 'last_name_person_6',
            hotkey: '',
        },
        {
            typeId: 50,
            internal: 'First name person 7',
            external: 'first_name_person_7',
            hotkey: '',
        },
        {
            typeId: 51,
            internal: 'Last name person 7',
            external: 'last_name_person_7',
            hotkey: '',
        },
        {
            typeId: 52,
            internal: 'First name person 8',
            external: 'first_name_person_8',
            hotkey: '',
        },
        {
            typeId: 53,
            internal: 'Last name person 8',
            external: 'last_name_person_8',
            hotkey: '',
        },
        {
            typeId: 3,
            internal: 'Username',
            external: 'username',
            hotkey: ''
        },
        {
            typeId: 4,
            internal: 'Email',
            external: 'email',
            hotkey: '3'
        },
        {
            typeId: 5,
            internal: 'Phone',
            external: 'phone',
            hotkey: '4'
        },
        {
            typeId: 6,
            internal: 'Address',
            external: 'address',
            hotkey: '5'
        },
        {
            typeId: 8,
            internal: 'Birth date',
            external: 'birth_date',
            hotkey: ''
        },
        {
            typeId: 54,
            internal: 'Procedure type 1',
            external: 'procedure_type_1',
            hotkey: '',
            onlyForUsers: [2]
            // onlyForEventTypes: [],
        },
        {
            typeId: 55,
            internal: 'Procedure type 2',
            external: 'procedure_type_2',
            hotkey: '',
            onlyForUsers: [2]
            // onlyForEventTypes: [],
        },
        {
            typeId: 56,
            internal: 'Procedure type 3',
            external: 'procedure_type_3',
            hotkey: '',
            onlyForUsers: [2]
            // onlyForEventTypes: [],
        },
        {
            typeId: 57,
            internal: 'Procedure type 4',
            external: 'procedure_type_4',
            hotkey: '',
            onlyForUsers: [2]
            // onlyForEventTypes: [],
        },
        {
            typeId: 58,
            internal: 'Procedure type 5',
            external: 'procedure_type_5',
            hotkey: '',
            onlyForUsers: [2]
            // onlyForEventTypes: [],
        },
        {
            typeId: 59,
            internal: 'Procedure type 6',
            external: 'procedure_type_6',
            hotkey: '',
            onlyForUsers: [2]
            // onlyForEventTypes: [],
        },
        {
            typeId: 7,
            internal: 'ID',
            external: 'id',
            hotkey: '',
            // onlyForEventTypes: [],
        },
        {
            typeId: 36,
            internal: 'Account ID',
            external: 'account_id',
            hotkey: ''
        },
        {
            typeId: 37,
            internal: 'Document ID',
            external: 'document_id',
            hotkey: ''
        },
        {
            typeId: 38,
            internal: 'Reservation ID',
            external: 'reservation_id',
            hotkey: '6'
        },
        {
            typeId: 39,
            internal: 'Transaction ID',
            external: 'transaction_id',
            hotkey: ''
        },
        {
            typeId: 9,
            internal: 'Bank account info',
            external: 'bank_account',
            hotkey: ''
        },
        {
            typeId: 10,
            internal: 'Credit card nr.',
            external: 'ccn',
            hotkey: ''
        },
        {
            typeId: 11,
            internal: 'Credit card nr. (last 4)',
            external: 'ccn_4',
            hotkey: ''
        },
        {
            typeId: 12,
            internal: 'Social security number',
            external: 'ssn',
            hotkey: ''
        },
        {
            typeId: 13,
            internal: 'Personal relation',
            external: 'relation',
            hotkey: ''
        },
        {
            typeId: 14,
            internal: 'Password',
            external: 'password',
            hotkey: ''
        },
        {
            typeId: 15,
            internal: 'Age',
            external: 'age',
            hotkey: ''
        },
        {
            typeId: 16,
            internal: 'Ethnicity',
            external: 'ethnicity',
            hotkey: ''
        },
        {
            typeId: 17,
            internal: 'Gender',
            external: 'gender',
            hotkey: ''
        },
        {
            typeId: 21,
            internal: 'Signature',
            external: 'signature',
            hotkey: ''
        },
        {
            typeId: 23,
            internal: 'Other',
            external: 'other_PII',
            hotkey: ''
        },
        {
            typeId: 18,
            internal: 'First name doctor 1',
            external: 'first_name_doctor_1',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 19,
            internal: 'Last name doctor 1',
            external: 'last_name_doctor_1',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 34,
            internal: 'First name doctor 2',
            external: 'first_name_doctor_2',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 35,
            internal: 'Last name doctor 2',
            external: 'last_name_doctor_2',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 42,
            internal: 'First name doctor 3',
            external: 'first_name_doctor_3',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 43,
            internal: 'Last name doctor 3',
            external: 'last_name_doctor_3',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 44,
            internal: 'First name doctor 4',
            external: 'first_name_doctor_4',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 45,
            internal: 'Last name doctor 4',
            external: 'last_name_doctor_4',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 46,
            internal: 'First name doctor 5',
            external: 'first_name_doctor_5',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 47,
            internal: 'Last name doctor 5',
            external: 'last_name_doctor_5',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 48,
            internal: 'First name doctor 6',
            external: 'first_name_doctor_6',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 49,
            internal: 'Last name doctor 6',
            external: 'last_name_doctor_6',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
        },
        {
            typeId: 20,
            internal: 'Email doctor',
            external: 'doctor_email',
            hotkey: '',
            onlyForEventTypes: [1], // For appointment only
            description: "Redact a doctor's email (name present) or any individual's email working for a provider before '@' sign. <br/><br/>E.g.: <br/>john.smith@healthcare.com <br/>" + '<span style="background: yellow; color:black;">[Email doctor]</span>@healthcare.com.'
        },
        {
            typeId: 24,
            internal: 'Date / time',
            // external: '[]',
            hotkey: '7',
            onlyForEventTypes: [1], // For appointment only
            functionName: 'randomizeDate',
            description: 'Select the full date, including the year, weekday if available. <br/><br/>E.g.: "Wednesday, Oct 18"'
            /*
                ● Either add or remove random number of weeks for the appointment date (random between 1 and 50)
                ● Keep the original formatting of the date
                ● Double check if the date is valid
                    o If date contains day of the week, it must match the date mentioned to be a valid date
            */
        },
        {
            typeId: 25,
            internal: 'Personal URL',
            external: 'url', // Not confirmed by the client yet
            hotkey: '8',
            onlyForEventTypes: [1], // For appointment only
            description: 'Keep the first part of the URL only and redact the rest. <br/><br/>E.g.:<br/> https://www.example.com/test/1234 <br/> https://www.example.com<span style="background: yellow; color:black;">[Personal URL]</span>'
            // "Redact URL after TLD" --> we might need to delete the url after the Top Level Domain only
        },
        {
            typeId: 22,
            internal: 'Procedure type',
            external: 'procedure',
            hotkey: '9',
            onlyForEventTypes: [1] // For appointment only
        },
    ],
    actionTypes: {
        1: {
            "internal": "Invitation",
            "external": "invitation"
        },
        2: {
            "internal": "Cancellation",
            "external": "cancellation"
        },
        3: {
            "internal": "Confirmation",
            "external": "confirmation"
        },
        4: {
            "internal": "Modification",
            "external": "modification"
        }
    },
    providerTypes: {
        1: {
            "internal": "Direct",
            "external": "direct_from_provider"
        },
        2: {
            "internal": "Third party",
            "external": "third_party"
        }
    },
    eventTypes: {
        1: {
            "internal": "Appointment",
            "external": "appointment",
            "clientOrder": "11",
            "providerLimit": 1000
        },
        2: {
            "internal": "Bus",
            "external": "bus",
            "clientOrder": "06",
            "providerLimit": 1000
        },
        3: {
            "internal": "Rental car",
            "external": "rental_car",
            "clientOrder": "04",
            "providerLimit": 50
        },
        4: {
            "internal": "Ferry",
            "external": "ferry",
            "clientOrder": "07",
            "providerLimit": 1000
        },
        5: {
            "internal": "Flight",
            "external": "flight",
            "clientOrder": "01",
            "providerLimit": 50
        },
        6: {
            "internal": "Hotel",
            "external": "hotel",
            "clientOrder": "02",
            "providerLimit": 50
        },
        7: {
            "internal": "Movie",
            "external": "movie",
            "clientOrder": "08",
            "providerLimit": 50
        },
        8: {
            "internal": "Party invitation",
            "external": "party_invitation",
            "clientOrder": "10",
            "providerLimit": 1000
        },
        9: {
            "internal": "Restaurant",
            "external": "restaurant",
            "clientOrder": "03",
            "providerLimit": 50
        },
        10: {
            "internal": "Show",
            "external": "show",
            "clientOrder": "09",
            "providerLimit": 50
        },
        11: {
            "internal": "Train",
            "external": "train",
            "clientOrder": "05",
            "providerLimit": 1000
        }
    },
    tripTypes: {
        1: {
            "internal": "One way",
            "external": "one_way"
        },
        2: {
            "internal": "Round trip",
            "external": "round_trip"
        },
        3: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    flightTripTypes: {
        1: {
            "internal": "One way",
            "external": "one_way"
        },
        2: {
            "internal": "Round trip",
            "external": "round_trip"
        },
        3: {
            "internal": "Multi-stop",
            "external": "multi_stop"
        },
        4: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    numberOfStops: [
        2, 3, 4, 5, 6, 7, 8, 9, 10
    ],
    roomTypes: {
        1: {
            "internal": "Single",
            "external": "single"
        },
        2: {
            "internal": "Multiple",
            "external": "multiple"
        },
        3: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    numberOfNights: {
        1: {
            "internal": "Single",
            "external": "single"
        },
        2: {
            "internal": "Multiple",
            "external": "multiple"
        },
        3: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    dropOffLocationTypes: {
        // ['same_location', 'different_location']
        1: {
            "internal": "Same",
            "external": "same_location"
        },
        2: {
            "internal": "Different",
            "external": "different_location"
        },
        3: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    trainSeatTypes: {
        1: {
            "internal": "Coach/ economy",
            "external": "coach/economy"
        },
        2: {
            "internal": "Business",
            "external": "business"
        },
        3: {
            "internal": "Sleeper/ sleeper+",
            "external": "sleeper/sleeper_plus"
        },
        4: {
            "internal": "Prestige",
            "external": "prestige"
        },
        5: {
            "internal": "With pets",
            "external": "with_pets"
        },
        6: {
            "internal": "Specific needs",
            "external": "specific_needs_passenger"
        },
        7: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    trainTicketTypes: {
        1: {
            "internal": "Advance",
            "external": "advance"
        },
        2: {
            "internal": "Off peak/ super off peak",
            "external": "off_peak/super_off_peak"
        },
        3: {
            "internal": "Anytime",
            "external": "anytime"
        },
        4: {
            "internal": "Season ticket/ flexi season ticket",
            "external": "season_ticket/flexi_season_ticket"
        },
        5: {
            "internal": "Ranger/ rover",
            "external": "ranger/rover"
        },
        6: {
            "internal": "Oyster/ contactless",
            "external": "oyster/contactless"
        },
        7: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    busSeatTypes: {
        1: {
            "internal": "Coach/ economy",
            "external": "coach/economy"
        },
        2: {
            "internal": "First/ business",
            "external": "first/business"
        },
        3: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    showTicketTypes: {
        1: {
            "internal": "VIP",
            "external": "vip"
        },
        2: {
            "internal": "General admission",
            "external": "general_admission"
        },
        3: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    showTypes: {
        1: {
            "internal": "Arts",
            "external": "arts"
        },
        2: {
            "internal": "Comedy",
            "external": "comedy"
        },
        3: {
            "internal": "Concert",
            "external": "concert"
        },
        4: {
            "internal": "Festival",
            "external": "festival"
        },
        5: {
            "internal": "Sports",
            "external": "sports"
        },
        6: {
            "internal": "Theater",
            "external": "theater"
        },
        7: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    showDurations: {
        1: {
            "internal": "Single",
            "external": "single"
        },
        2: {
            "internal": "Multiple",
            "external": "multiple"
        },
        3: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    partyInvitationTypes: {
        1: {
            "internal": "Birthday/ celebration of life",
            "external": "birthday/celebration_of_life"
        },
        2: {
            "internal": "Business",
            "external": "business"
        },
        3: {
            "internal": "Dining/ entertaining",
            "external": "dining/entertaining"
        },
        4: {
            "internal": "Get together",
            "external": "get_together"
        },
        5: {
            "internal": "Graduation",
            "external": "graduation"
        },
        6: {
            "internal": "Holiday",
            "external": "holiday"
        },
        7: {
            "internal": "Sports",
            "external": "sports"
        },
        8: {
            "internal": "Theme party",
            "external": "theme_party"
        },
        9: {
            "internal": "Wedding/ anniversary",
            "external": "wedding/anniversary"
        }
    },
    partyInvitationFormats: {
        1: {
            "internal": "Text",
            "external": "text"
        },
        2: {
            "internal": "Visual",
            "external": "visual"
        }
    },
    partyInvitationTemplates: {
        1: {
            "internal": "Centered text",
            "external": "centered_text"
        },
        2: {
            "internal": "Bottom centered text",
            "external": "bottom_centered_text"
        },
        3: {
            "internal": "Bottom left text",
            "external": "bottom_left_text"
        },
        4: {
            "internal": "Bottom right text",
            "external": "bottom_right_text"
        },
        5: {
            "internal": "Upper left text",
            "external": "upper_left_text"
        },
        6: {
            "internal": "Upper right text",
            "external": "upper_right_text"
        },
        7: {
            "internal": "Split text",
            "external": "split_text"
        },
        8: {
            "internal": "Centered left text",
            "external": "centered_left_text"
        },
        9: {
            "internal": "Centered right text",
            "external": "centered_right_text"
        },
        10: {
            "internal": "Upper centered text",
            "external": "upper_centered_text"
        },
    },
    partyInvitationTextOrganizations: {
        1: {
            "internal": "Combined date time",
            "external": "combined_date_time"
        },
        2: {
            "internal": "Split date time",
            "external": "split_date_time"
        }
    },
    partyInvitationTextOrganizations2: {
        1: {
            "internal": "Bottom left description",
            "external": "bottom_left_description"
        },
        2: {
            "internal": "Center top description",
            "external": "center_top_description"
        },
        3: {
            "internal": "Upper left description",
            "external": "upper_left_description"
        },
        4: {
            "internal": "Upper right description",
            "external": "upper_right_description"
        }
    },
    appointmentVisitTypes: {
        1: {
            "internal": "Dentist",
            "external": "dentist"
        },
        2: {
            "internal": "Doctor",
            "external": "doctor"
        },
        3: {
            "internal": "Personal care",
            "external": "personal_care"
        },
        4: {
            "internal": "Specialty doctor",
            "external": "specialty_doctor"
        },
        5: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    appointmentTypes: {
        1: {
            "internal": "Family member",
            "external": "family_member"
        },
        2: {
            "internal": "Self",
            "external": "self"
        },
        3: {
            "internal": "N/A",
            "external": "N/A"
        }
    },
    screenshotZoomValues: {
        1: 20,
        2: 30,
        3: 40,
        4: 50,
    },
    locales: {
        'au': 'Australia',
        'ca': 'Canada',
        'in': 'India',
        'gb': 'United Kingdom',
        'us': 'United States',
    },
    genders: {
        0: "Female",
        1: "Male",
        2: "Non-binary",
        3: "I use another term"
    },
    ageRanges: [
        "<18",
        "18-35",
        "36-49",
        "50+"
    ],
    minimumAges: {
        'ca': 18,
        'us': 18,
        'in': 18,
        'ph': 18,
        'br': 18,
        'co': 18,
        'sv': 18,
        'mx': 18,
        'cl': 18,
        'gt': 18,
        'gb': 18,
        'au': 18,
    },
    englishLevels: {
        0: "No proficiency",
        1: "Beginner",
        2: "Intermediate",
        3: "Fluent",
        4: "Native"
    },
    fileExtensions: {
        1: 'jpg',
        2: 'jpeg',
        3: 'png',
        4: 'bmp',
        5: 'gif',
        6: 'webp',
        7: 'svg',
        8: 'pdf',
        9: 'doc',
        10: 'docx',
    },
    languagesList: [
        '',
        'Albanian',
        'Ambonese',
        'Amharic',
        'Arabic',
        'Armenian',
        'Azerbaijani',
        'Balinese',
        'Banjar',
        'Basque',
        'Batak',
        'Belarusian',
        'Bengali',
        'Brazilian Portuguese',
        'Breton',
        'Buginese',
        'Bulgarian',
        'Burmese',
        'Catalan',
        'Chamorro',
        'Chichewa',
        'Chinese',
        'Chuukese',
        'Cook Islands Maori',
        'Corsican',
        'Croatian',
        'Czech',
        'Danish',
        'Dayak',
        'Dutch',
        'Dzongkha',
        'English',
        'Estonian',
        'Fijian',
        'Finnish',
        'French',
        'Galician',
        'Georgian',
        'German',
        'Gorontalo',
        'Greek',
        'Hausa',
        'Hawaiian',
        'Hebrew',
        'Hindi',
        'Hungarian',
        'Icelandic',
        'Igbo',
        'Indonesian',
        'Irish',
        'Italian',
        'Japanese',
        'Javanese',
        'Kazakh',
        'Khmer',
        'Kinyarwanda',
        'Kiribati',
        'Kirundi',
        'Kiswahili',
        'Korean',
        'Kosraean',
        'Kyrgyz',
        'Lao',
        'Latvian',
        'Lithuanian',
        'Luganda',
        'Luxembourgish',
        'Macedonian',
        'Madurese',
        'Makassarese',
        'Malagasy',
        'Malay',
        'Maltese',
        'Manadonese',
        'Maori',
        'Marshallese',
        'Minahasan',
        'Minangkabau',
        'Moldovan',
        'Mongolian',
        'Nauruan',
        'Ndebele',
        'Nepali',
        'Niuean',
        'Norwegian',
        'Oromo',
        'Palauan',
        'Papuan',
        'Persian',
        'Pohnpeian',
        'Polish',
        'Portuguese',
        'Punjabi',
        'Romanian',
        'Russian',
        'Samoan',
        'Sasak',
        'Scottish Gaelic',
        'Serbian',
        'Sesotho',
        'Setswana',
        'Shona',
        'Sinhala',
        'Siswati',
        'Slovak',
        'Slovenian',
        'Somali',
        'Sotho',
        'Spanish',
        'Sundanese',
        'Swahili',
        'Swazi',
        'Swedish',
        'Tagalog',
        'Tahitian',
        'Tajik',
        'Thai',
        'Tigrinya',
        'Tokelauan',
        'Tongan',
        'Toraja',
        'Tsonga',
        'Tswana',
        'Turkish',
        'Turkmen',
        'Tuvaluan',
        'Ukrainian',
        'Urdu',
        'Uzbek',
        'Venda',
        'Vietnamese',
        'Welsh',
        'Xhosa',
        'Xitsonga',
        'Yapese',
        'Yoruba',
        'Zulu',
        'Other'
    ],
    regFormCompensation: {
        // For 100 emails
        'au': '100.00',  // Australia
        'ca': '100.00',  // Canada
        'gb': '100.00',  // United Kingdom
        'us': '100.00',  // United States
        'in': '60.00', // India
    },
    regFormCompensation2: {
        // For emails
        'au': '1',  // Australia
        'ca': '1',  // Canada
        'gb': '1',  // United Kingdom
        'us': '1',  // United States
        'in': '0.60', // India
    },
    regFormCompensation3: {
        // For text messages
        'au': '0.80',  // Australia
        'ca': '0.80',  // Canada
        'gb': '0.80',  // United Kingdom
        'us': '0.80',  // United States
        'in': '0.40', // India
    },
    filterCountries: [
        10,
        33,
        82,
        196,
        197,
        'Other'
    ],
    countries: {
        0: '',
        1: 'Afghanistan',
        2: 'Albania',
        3: 'Algeria',
        4: 'Andorra',
        5: 'Angola',
        6: 'Antigua and Barbuda',
        7: 'Argentina',
        8: 'Armenia',
        9: 'Aruba',
        10: 'Australia',
        11: 'Austria',
        12: 'Azerbaijan',
        13: 'Bahamas, The',
        14: 'Bahrain',
        15: 'Bangladesh',
        16: 'Barbados',
        17: 'Belarus',
        18: 'Belgium',
        19: 'Belize',
        20: 'Benin',
        21: 'Bhutan',
        22: 'Bolivia',
        23: 'Bosnia and Herzegovina',
        24: 'Botswana',
        25: 'Brazil',
        26: 'Brunei',
        27: 'Bulgaria',
        28: 'Burkina Faso',
        29: 'Burma',
        30: 'Burundi',
        31: 'Cambodia',
        32: 'Cameroon',
        33: 'Canada',
        34: 'Cabo Verde',
        35: 'Central African Republic',
        36: 'Chad',
        37: 'Chile',
        38: 'China',
        39: 'Colombia',
        40: 'Comoros',
        41: 'Congo, Democratic Republic of the',
        42: 'Congo, Republic of the',
        43: 'Costa Rica',
        44: "Cote d'Ivoire",
        45: 'Croatia',
        46: 'Cuba',
        47: 'Curacao',
        48: 'Cyprus',
        49: 'Czechia',
        50: 'Denmark',
        51: 'Djibouti',
        52: 'Dominica',
        53: 'Dominican Republic',
        54: 'East Timor',
        55: 'Ecuador',
        56: 'Egypt',
        57: 'El Salvador',
        58: 'Equatorial Guinea',
        59: 'Eritrea',
        60: 'Estonia',
        61: 'Ethiopia',
        62: 'Fiji',
        63: 'Finland',
        64: 'France',
        65: 'Gabon',
        66: 'Gambia, The',
        67: 'Georgia',
        68: 'Germany',
        69: 'Ghana',
        70: 'Greece',
        71: 'Grenada',
        72: 'Guatemala',
        73: 'Guinea',
        74: 'Guinea-Bissau',
        75: 'Guyana',
        76: 'Haiti',
        77: 'Holy See',
        78: 'Honduras',
        79: 'Hong Kong',
        80: 'Hungary',
        81: 'Iceland',
        82: 'India',
        83: 'Indonesia',
        84: 'Iran',
        85: 'Iraq',
        86: 'Ireland',
        87: 'Israel',
        88: 'Italy',
        89: 'Jamaica',
        90: 'Japan',
        91: 'Jordan',
        92: 'Kazakhstan',
        93: 'Kenya',
        94: 'Kiribati',
        95: 'Korea, North',
        96: 'Korea, South',
        97: 'Kosovo',
        98: 'Kuwait',
        99: 'Kyrgyzstan',
        100: 'Laos',
        101: 'Latvia',
        102: 'Lebanon',
        103: 'Lesotho',
        104: 'Liberia',
        105: 'Libya',
        106: 'Liechtenstein',
        107: 'Lithuania',
        108: 'Luxembourg',
        109: 'Macau',
        110: 'Macedonia',
        111: 'Madagascar',
        112: 'Malawi',
        113: 'Malaysia',
        114: 'Maldives',
        115: 'Mali',
        116: 'Malta',
        117: 'Marshall Islands',
        118: 'Mauritania',
        119: 'Mauritius',
        120: 'Mexico',
        121: 'Micronesia',
        122: 'Moldova',
        123: 'Monaco',
        124: 'Mongolia',
        125: 'Montenegro',
        126: 'Morocco',
        127: 'Mozambique',
        128: 'Namibia',
        129: 'Nauru',
        130: 'Nepal',
        131: 'Netherlands',
        132: 'New Zealand',
        133: 'Nicaragua',
        134: 'Niger',
        135: 'Nigeria',
        136: 'North Korea',
        137: 'Norway',
        138: 'Oman',
        139: 'Pakistan',
        140: 'Palau',
        141: 'Palestinian Territories',
        142: 'Panama',
        143: 'Papua New Guinea',
        144: 'Paraguay',
        145: 'Peru',
        146: 'Philippines',
        147: 'Poland',
        148: 'Portugal',
        149: 'Qatar',
        150: 'Romania',
        151: 'Russia',
        152: 'Rwanda',
        153: 'Saint Kitts and Nevis',
        154: 'Saint Lucia',
        155: 'Saint Vincent and the Grenadines',
        156: 'Samoa',
        157: 'San Marino',
        158: 'Sao Tome and Principe',
        159: 'Saudi Arabia',
        160: 'Senegal',
        161: 'Serbia',
        162: 'Seychelles',
        163: 'Sierra Leone',
        164: 'Singapore',
        165: 'Sint Maarten',
        166: 'Slovakia',
        167: 'Slovenia',
        168: 'Solomon Islands',
        169: 'Somalia',
        170: 'South Africa',
        171: 'South Korea',
        172: 'South Sudan',
        173: 'Spain',
        174: 'Sri Lanka',
        175: 'Sudan',
        176: 'Suriname',
        177: 'Swaziland',
        178: 'Sweden',
        179: 'Switzerland',
        180: 'Syria',
        181: 'Taiwan',
        182: 'Tajikistan',
        183: 'Tanzania',
        184: 'Thailand',
        185: 'Timor-Leste',
        186: 'Togo',
        187: 'Tonga',
        188: 'Trinidad and Tobago',
        189: 'Tunisia',
        190: 'Turkey',
        191: 'Turkmenistan',
        192: 'Tuvalu',
        193: 'Uganda',
        194: 'Ukraine',
        195: 'United Arab Emirates',
        196: 'United Kingdom',
        197: 'United States',
        198: 'Uruguay',
        199: 'Uzbekistan',
        200: 'Vanuatu',
        201: 'Venezuela',
        202: 'Vietnam',
        203: 'Yemen',
        204: 'Zambia',
        205: 'Zimbabwe'
    },
    countryShortCodes: {
        10: 'au',
        33: 'ca',
        82: 'in',
        196: 'gb',
        197: 'us',
    },
    states: {
        au: {
            0: '',
            1: 'Australian Capital Territory',
            2: 'Jervis Bay Territory',
            3: 'New South Wales',
            4: 'Northern Territory',
            5: 'Queensland',
            6: 'South Australia',
            7: 'Tasmania',
            8: 'Victoria',
            9: 'Western Australia',
            10: 'Other'
        },
        ca: {
            0: '',
            1: 'Alberta',
            2: 'British Columbia',
            3: 'Manitoba',
            4: 'New Brunswick',
            5: 'Newfoundland and Labrador',
            6: 'Nova Scotia',
            7: 'Ontario',
            8: 'Prince Edward Island',
            9: 'Quebec',
            10: 'Saskatchewan',
            11: 'Northwest Territories',
            12: 'Nunavut',
            13: 'Yukon'
        },
        gb: {
            0: '',
            1: 'East Midlands',
            2: 'East of England',
            3: 'London',
            4: 'North East',
            5: 'North West',
            6: 'Northern Ireland',
            7: 'Scotland',
            8: 'South East',
            9: 'South West',
            10: 'Wales',
            11: 'West Midlands',
            12: 'Yorkshire and The Humber'
        },
        in: {
            0: '',
            1: 'Andhra Pradesh',
            2: 'Arunachal Pradesh',
            3: 'Assam',
            4: 'Bihar',
            5: 'Chhattisgarh',
            6: 'Goa',
            7: 'Gujarat',
            8: 'Haryana',
            9: 'Himachal Pradesh',
            10: 'Jammu and Kashmir',
            11: 'Jharkhand',
            12: 'Karnataka',
            13: 'Kerala',
            14: 'Madhya Pradesh',
            15: 'Maharashtra',
            16: 'Manipur',
            17: 'Meghalaya',
            18: 'Mizoram',
            19: 'Nagaland',
            20: 'Odisha',
            21: 'Punjab',
            22: 'Rajasthan',
            23: 'Sikkim',
            24: 'Tamil Nadu',
            25: 'Telangana',
            26: 'Tripura',
            27: 'Uttar Pradesh',
            28: 'Uttarakhand',
            29: 'West Bengal',
            30: 'Andaman and Nicobar Islands',
            31: 'Chandigarh',
            32: 'Dadra and Nagar Haveli and Daman and Diu',
            33: 'Delhi',
            34: 'Ladakh',
            35: 'Lakshadweep',
            36: 'Puducherry',
        },
        us: {
            0: '',
            1: 'Alabama',
            2: 'Alaska',
            3: 'Arizona',
            4: 'Arkansas',
            5: 'California',
            6: 'Colorado',
            7: 'Connecticut',
            8: 'Delaware',
            9: 'Florida',
            10: 'Georgia',
            11: 'Hawaii',
            12: 'Idaho',
            13: 'Illinois',
            14: 'Indiana',
            15: 'Iowa',
            16: 'Kansas',
            17: 'Kentucky',
            18: 'Louisiana',
            19: 'Maine',
            20: 'Maryland',
            21: 'Massachusetts',
            22: 'Michigan',
            23: 'Minnesota',
            24: 'Mississippi',
            25: 'Missouri',
            26: 'Montana',
            27: 'Nebraska',
            28: 'Nevada',
            29: 'New Hampshire',
            30: 'New Jersey',
            31: 'New Mexico',
            32: 'New York',
            33: 'North Carolina',
            34: 'North Dakota',
            35: 'Ohio',
            36: 'Oklahoma',
            37: 'Oregon',
            38: 'Pennsylvania',
            39: 'Rhode Island',
            40: 'South Carolina',
            41: 'South Dakota',
            42: 'Tennessee',
            43: 'Texas',
            44: 'Utah',
            45: 'Vermont',
            46: 'Virginia',
            47: 'Washington',
            48: 'West Virginia',
            49: 'Wisconsin',
            50: 'Wyoming'
        }
    },
    localesForDelivery: {
        'us': 'en_US',
        'ca': 'en_CA',
        'gb': 'en_GB',
        'au': 'en_AU',
        'in': 'en_IN'
    },
    localeOrderForClient: [
        'us',
        'au',
        'ca',
        'gb',
        'in'
    ],
    guidelines: {
        'ca': 'https://docs.google.com/presentation/d/1yhH-wGtfccdf9VQCoc9b3JvyxeiymQdj2KVcGrfkFPE',
        'in': 'https://docs.google.com/presentation/d/1C48dKp15ytoJ44KLnkctgAdcX4xCB8cS3tLwgQwkI7w',
        'gb': 'https://docs.google.com/presentation/d/117vH7pSjl2Wq58nAxdDIi2-nb_6OSDJONwOKimv5gUM',
        'au': 'https://docs.google.com/presentation/d/18-EkU_gdSTajjVKSaYAPe3vOm01kMe7cFt4EZCy3oiY',
        'us': 'https://docs.google.com/presentation/d/1xPWV-qT2hMUasnreuOZth6QIlxQLFpVcKuGD8qpTVvI'
    },
    deliveryLimitValues: [
        1000,
        2000,
        3000,
        4000,
        5000
    ],
    deliveryStartAtValues: [
        1,
        1001,
        2001,
        3001,
        4001,
        5001,
        6001,
        7001,
        8001,
        9001,
        10001
    ],
    scenarios: {
        0: "Undisguised",
        1: "Print Spoof",
        2: "Replay Spoof",
        3: "Cutout Spoof",
        4: "Wall Portrait Spoof",
        5: "Validation Photo",
        6: "Wall Protrait Validation",
        7: "Undisguised Validation",
        8: "Print Spoof Validation",
        9: "Replay Spoof Validation",
        10: "Cutout Spoof Validation"
    },
    assetType: {
        0: "How will this be handled???"
    },
    deviceHeight: {
        0: "2.3ft",
        1: "3.4ft"
    },
    approachAngle: {
        0: "left",
        1: "right",
        2: "center"
    },
    lighting: {
        0: "low",
        1: "medium",
        2: "bright"
    },
    clothing: {
        //bear in mind that here multiple selections are probable so perhaps checkboxes
        0: "tops",
        1: "sweatshirt",
        2: "jacket",
        3: "dress",
        4: "skirt",
        5: "suit",
        6: "sportswear",
        7: "none",
        8: "other"
    },
    accessories: {
        //bear in mind that here multiple selections are probable so perhaps checkboxes
        0: "sunglasses",
        1: "reading glasses",
        2: "mask",
        3: "scarf",
        4: "necklace",
        5: "earrings",
        6: "nose rings",
        7: "finger rings",
        8: "bracelets",
        9: "watch",
        10: "none",
        11: "other"
    }

}

export default Constants;