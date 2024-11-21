const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "additionalProperties": false,
    "minProperties": 1,
    "properties": {
        "contribution_date": {
            "type": "integer",
            "minimum": 20220801
        },
        "assets": {
            "type": "array",
            "uniqueItems": true,
            "items": {
                "type": "object",
                "additionalProperties": false,
                "minProperties": 1,
                "properties": {
                    "asset_basename": {
                        "type": "string",
                        "pattern": "^[a-zA-Z\\d_-]{1,180}\\.([a-zA-Z\\d]{1,9})$",
                        //"error": "must be letters, numbers, '_', '-'. Only one '.'. Extension must be 1 or 9 letters or numbers."
                    },
                    "asset_md5": {
                        "type": "string",
                        "pattern": "^[a-f\\d]{32}$",
                        //"error": "must be 32 lowercase numbers and letters a through f"
                    },
                    "asset_metadata": {
                        "type": "object",
                        "additionalProperties": false,
                        "minProperties": 1,
                        "properties": {
                            "additional": {
                                "type": "object",
                                "additionalProperties": false,
                                "minProperties": 1,
                                "properties": {
                                    "message_id": {
                                        "type": "string",
                                        "minLength": 1
                                    },
                                    "category": {
                                        "enum": [
                                            "email",
                                            "attachment",
                                            "text_message"
                                        ]
                                    },
                                    "email_domain": {
                                        "type": "string",
                                        "minLength": 1
                                    },
                                    "message_subject": {
                                        "type": "string",
                                        "minLength": 1
                                    },
                                    "locale": {
                                        "enum": [
                                            "en_US",
                                            "en_GB",
                                            "en_CA",
                                            "en_AU",
                                            "en_IN"
                                        ]
                                    },
                                    "action_type": {
                                        "enum": [
                                            "invitation",
                                            "confirmation",
                                            "cancellation",
                                            "modification"
                                        ]
                                    },
                                    "provider_type": {
                                        "enum": [
                                            "direct_from_provider",
                                            "third_party"
                                        ]
                                    },
                                    "provider_name": {
                                        "type": "string",
                                        "minLength": 1
                                    },
                                    "event_type": {
                                        "type": "array",
                                        "uniqueItems": false,
                                        "items": {
                                            "enum": [
                                                "flight",
                                                "hotel",
                                                "restaurant",
                                                "rental_car",
                                                "train",
                                                "bus",
                                                "ferry",
                                                "movie",
                                                "show",
                                                "party_invitation",
                                                "appointment"
                                            ]
                                        },
                                        "minItems": 1
                                    },
                                    "standardized_timestamp": {
                                        "type": "integer",
                                        "minimum": 20220801
                                    },
                                    "original_timestamp": {
                                        "type": "string",
                                        "minLength": 1
                                    },
                                    "party_size": {
                                        "type": "string",
                                        "pattern": "(^[\\d\\-]+$)|(N\\/A)",
                                        //"error": "Party size must be string N/A or be comprised of digits and the - char only"
                                    },
                                    "text_content": {
                                        "type": "string",
                                        "minLength": 1
                                    },
                                    "flight_metadata": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "minProperties": 1,
                                        "properties": {
                                            "trip_type": {
                                                "enum": [
                                                    "one_way",
                                                    "round_trip",
                                                    "N/A",
                                                    "multi_stop"
                                                ]
                                            },
                                            "number_of_stops": {
                                                "type": "integer",
                                                "minimum": 1
                                            }
                                        },
                                        "required": [
                                            "trip_type"
                                        ],
                                        "allOf": [
                                            {
                                                "if": {
                                                    "properties": {
                                                        "trip_type": {
                                                            "const": "multi_stop"
                                                        }
                                                    }
                                                },
                                                "then": {
                                                    "required": [
                                                        "number_of_stops"
                                                    ]
                                                }
                                            }
                                        ]
                                    },
                                    "hotel_metadata": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "minProperties": 1,
                                        "properties": {
                                            "room_type": {
                                                "enum": [
                                                    "single",
                                                    "multiple",
                                                    "N/A"
                                                ]
                                            },
                                            "number_of_nights": {
                                                "enum": [
                                                    "single",
                                                    "multiple",
                                                    "N/A"
                                                ]
                                            }
                                        },
                                        "required": [
                                            "room_type",
                                            "number_of_nights"
                                        ]
                                    },
                                    "rental_car_metadata": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "minProperties": 1,
                                        "properties": {
                                            "pickup_dropoff": {
                                                "enum": [
                                                    "same_location",
                                                    "different_location",
                                                    "N/A"
                                                ]
                                            },
                                            "pickup_location": {
                                                "type": "string",
                                                "minLength": 1
                                            },
                                            "dropoff_location": {
                                                "type": "string",
                                                "minLength": 1
                                            },
                                            "trip_type": {
                                                "enum": [
                                                    "one_way",
                                                    "round_trip",
                                                    "N/A"
                                                ]
                                            }
                                        },
                                        "required": [
                                            "pickup_dropoff",
                                            "pickup_location",
                                            "dropoff_location",
                                            "trip_type"
                                        ]
                                    },
                                    "train_metadata": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "minProperties": 1,
                                        "properties": {
                                            "trip_type": {
                                                "enum": [
                                                    "one_way",
                                                    "round_trip",
                                                    "N/A"
                                                ]
                                            },
                                            "seat_type": {
                                                "enum": [
                                                    "coach/economy",
                                                    "business",
                                                    "sleeper/sleeper_plus",
                                                    "prestige",
                                                    "with_pets",
                                                    "specific_needs_passenger",
                                                    "N/A"
                                                ]
                                            },
                                            "ticket_type": {
                                                "enum": [
                                                    "advance",
                                                    "off_peak/super_off_peak",
                                                    "anytime",
                                                    "season_ticket/flexi_season_ticket",
                                                    "ranger/rover",
                                                    "oyster/contactless",
                                                    "N/A"
                                                ]
                                            }
                                        },
                                        "required": [
                                            "trip_type",
                                            "seat_type",
                                            "ticket_type"
                                        ]
                                    },
                                    "bus_metadata": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "minProperties": 1,
                                        "properties": {
                                            "trip_type": {
                                                "enum": [
                                                    "one_way",
                                                    "round_trip",
                                                    "N/A"
                                                ]
                                            },
                                            "seat_type": {
                                                "enum": [
                                                    "coach/economy",
                                                    "first/business",
                                                    "N/A"
                                                ]
                                            }
                                        },
                                        "required": [
                                            "trip_type",
                                            "seat_type"
                                        ]
                                    },
                                    "ferry_metadata": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "minProperties": 1,
                                        "properties": {
                                            "trip_type": {
                                                "enum": [
                                                    "one_way",
                                                    "round_trip",
                                                    "N/A"
                                                ]
                                            }
                                        },
                                        "required": [
                                            "trip_type"
                                        ]
                                    },
                                    "show_metadata": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "minProperties": 1,
                                        "properties": {
                                            "ticket_type": {
                                                "enum": [
                                                    "vip",
                                                    "general_admission",
                                                    "N/A"
                                                ]
                                            },
                                            "show_type": {
                                                "enum": [
                                                    "concert",
                                                    "comedy",
                                                    "theater",
                                                    "arts",
                                                    "sports",
                                                    "festival",
                                                    "N/A"
                                                ]
                                            },
                                            "show_duration": {
                                                "enum": [
                                                    "single",
                                                    "multiple",
                                                    "N/A"
                                                ]
                                            }
                                        },
                                        "required": [
                                            "ticket_type",
                                            "show_type"
                                        ],
                                        "allOf": [
                                            {
                                                "if": {
                                                    "properties": {
                                                        "show_type": {
                                                            "enum": [
                                                                "festival"
                                                            ]
                                                        }
                                                    }
                                                },
                                                "then": {
                                                    "required": [
                                                        "show_duration"
                                                    ]
                                                }
                                            }
                                        ]
                                    },
                                    "party_invitation_metadata": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "minProperties": 1,
                                        "properties": {
                                            "invitation_type": {
                                                "enum": [
                                                    "graduation",
                                                    "wedding/anniversary",
                                                    "birthday/celebration_of_life",
                                                    "dining/entertaining",
                                                    "get_together",
                                                    "theme_party",
                                                    "sports",
                                                    "holiday",
                                                    "business"
                                                ]
                                            },
                                            "invitation_format": {
                                                "enum": [
                                                    "text",
                                                    "visual"
                                                ]
                                            },
                                            "invitation_template": {
                                                "enum": [
                                                    "centered_text",
                                                    "centered_left_text",
                                                    "centered_right_text",
                                                    "bottom_centered_text",
                                                    "upper_centered_text",
                                                    "bottom_left_text",
                                                    "bottom_right_text",
                                                    "upper_left_text",
                                                    "upper_right_text",
                                                    "split_text"
                                                ]
                                            },
                                            "text_organization": {
                                                "enum": [
                                                    "combined_date_time",
                                                    "split_date_time",
                                                    "bottom_left_description",
                                                    "upper_left_description",
                                                    "upper_right_description",
                                                    "center_top_description"
                                                ]
                                            }
                                        },
                                        "required": [
                                            "invitation_type",
                                            "invitation_format"
                                        ],
                                        "allOf": [
                                            {
                                                "if": {
                                                    "properties": {
                                                        "invitation_format": {
                                                            "enum": [
                                                                "visual"
                                                            ]
                                                        }
                                                    }
                                                },
                                                "then": {
                                                    "required": [
                                                        "invitation_template"
                                                    ]
                                                }
                                            },
                                            {
                                                "if": {
                                                    "properties": {
                                                        "invitation_format": {
                                                            "enum": [
                                                                "visual"
                                                            ]
                                                        },
                                                        "invitation_template": {
                                                            "enum": [
                                                                "centered_text"
                                                            ]
                                                        }
                                                    }
                                                },
                                                "then": {
                                                    "properties": {
                                                        "text_organization": {
                                                            "enum": [
                                                                "combined_date_time",
                                                                "split_date_time"
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "if": {
                                                    "properties": {
                                                        "invitation_format": {
                                                            "enum": [
                                                                "visual"
                                                            ]
                                                        },
                                                        "invitation_template": {
                                                            "enum": [
                                                                "split_text"
                                                            ]
                                                        }
                                                    }
                                                },
                                                "then": {
                                                    "properties": {
                                                        "text_organization": {
                                                            "enum": [
                                                                "bottom_left_description",
                                                                "upper_left_description",
                                                                "upper_right_description",
                                                                "center_top_description"
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "if": {
                                                    "properties": {
                                                        "invitation_format": {
                                                            "enum": [
                                                                "visual"
                                                            ]
                                                        },
                                                        "invitation_template": {
                                                            "enum": [
                                                                "centered_text",
                                                                "split_text"
                                                            ]
                                                        }
                                                    }
                                                },
                                                "then": {
                                                    "required": [
                                                        "text_organization"
                                                    ]
                                                }
                                            }
                                        ]
                                    },
                                    "appointment_metadata": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "minProperties": 1,
                                        "properties": {
                                            "visit_type": {
                                                "enum": [
                                                    "doctor",
                                                    "dentist",
                                                    "specialty_doctor",
                                                    "personal_care",
                                                    "N/A"
                                                ]
                                            },
                                            "appointment_type": {
                                                "enum": [
                                                    "self",
                                                    "family_member",
                                                    "N/A"
                                                ]
                                            },
                                            "state_region": {
                                                "type": "string",
                                                "minLength": 1
                                            }
                                        },
                                        "required": [
                                            "visit_type",
                                            "appointment_type",
                                            "state_region"
                                        ]
                                    }
                                },
                                "required": [
                                    "message_id",
                                    "category",
                                    "locale",
                                    "action_type",
                                    "provider_type",
                                    "event_type"
                                ],
                                "allOf": [
                                    {
                                        "if": {
                                            "properties": {
                                                "category": {
                                                    "enum": [
                                                        "email",
                                                        "attachment"
                                                    ]
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "email_domain"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "category": {
                                                    "enum": [
                                                        "email",
                                                        "attachment"
                                                    ]
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "message_subject"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "flight",
                                                            "hotel",
                                                            "restaurant",
                                                            "rental_car",
                                                            "train",
                                                            "bus",
                                                            "ferry",
                                                            "movie",
                                                            "show",
                                                            "party_invitation"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "standardized_timestamp"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "flight",
                                                            "hotel",
                                                            "restaurant",
                                                            "rental_car",
                                                            "train",
                                                            "bus",
                                                            "ferry",
                                                            "movie",
                                                            "show",
                                                            "party_invitation"
                                                        ]
                                                    }
                                                },
                                                "category": {
                                                    "enum": [
                                                        "email",
                                                        "attachment"
                                                    ]
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "original_timestamp"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "flight",
                                                            "restaurant",
                                                            "rental_car",
                                                            "train",
                                                            "bus",
                                                            "ferry",
                                                            "movie",
                                                            "show"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "party_size"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "category": {
                                                    "enum": [
                                                        "text_message"
                                                    ]
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "text_content"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "flight"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "flight_metadata"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "hotel"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "hotel_metadata"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "rental_car"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "rental_car_metadata"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "train"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "train_metadata"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "bus"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "bus_metadata"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "ferry"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "ferry_metadata"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "show"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "show_metadata"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "party_invitation"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "party_invitation_metadata"
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "event_type": {
                                                    "contains": {
                                                        "enum": [
                                                            "appointment"
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        "then": {
                                            "required": [
                                                "appointment_metadata"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        "required": [
                            "additional"
                        ]
                    }
                },
                "required": [
                    "asset_basename",
                    "asset_md5",
                    "asset_metadata"
                ]
            },
            "minItems": 1
        }
    },
    "required": [
        "contribution_date",
        "assets"
    ]
}

export default schema;