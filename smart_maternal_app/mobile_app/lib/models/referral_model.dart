class ReferralModel {
  final String id;
  final String referralCode;
  final String motherId;
  final dynamic fromHospital;
  final String? fromFacilityType;
  final dynamic toHospital;
  final String? toFacilityType;
  final dynamic createdBy;
  final String patientName;
  final String patientPhone;
  final String urgency;
  final String reasonForReferral;
  final String? clinicalNotes;
  final List<String> attachments;
  final int? gestationalAge;
  final DateTime? expectedDeliveryDate;
  final int? gravida;
  final int? para;
  final String? clinicalCondition;
  final String riskLevel;
  final MotherSnapshot? motherSnapshot;
  final String? liaisonNote;
  final bool isUnlocked;
  final DateTime? expiresAt;
  final DateTime? expiredAt;
  final DateTime? gateCheckedInAt;
  final String status;
  final DateTime? acceptedAt;
  final DateTime? completedAt;
  final String? targetDepartment;
  final DecisionMeta? decisionMeta;
  final List<ActivityLogItem> activityLog;
  final DateTime createdAt;
  final DateTime updatedAt;

  ReferralModel({
    required this.id,
    required this.referralCode,
    required this.motherId,
    required this.fromHospital,
    this.fromFacilityType,
    required this.toHospital,
    this.toFacilityType,
    required this.createdBy,
    required this.patientName,
    required this.patientPhone,
    required this.urgency,
    required this.reasonForReferral,
    this.clinicalNotes,
    this.attachments = const [],
    this.gestationalAge,
    this.expectedDeliveryDate,
    this.gravida,
    this.para,
    this.clinicalCondition,
    this.riskLevel = 'LOW',
    this.motherSnapshot,
    this.liaisonNote,
    this.isUnlocked = false,
    this.expiresAt,
    this.expiredAt,
    this.gateCheckedInAt,
    required this.status,
    this.acceptedAt,
    this.completedAt,
    this.targetDepartment,
    this.decisionMeta,
    this.activityLog = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory ReferralModel.fromJson(Map<String, dynamic> json) {
    return ReferralModel(
      id: json['_id'] ?? json['id'] ?? '',
      referralCode: json['referralCode'] ?? '',
      motherId: json['motherId'] is Map
          ? json['motherId']['_id']?.toString() ?? ''
          : json['motherId']?.toString() ?? '',
      fromHospital: json['fromHospital'],
      fromFacilityType: json['fromFacilityType'],
      toHospital: json['toHospital'],
      toFacilityType: json['toFacilityType'],
      createdBy: json['createdBy'],
      patientName: json['patientName'] ?? '',
      patientPhone: json['patientPhone'] ?? '',
      urgency: json['urgency'] ?? 'NORMAL',
      reasonForReferral: json['reasonForReferral'] ?? '',
      clinicalNotes: json['clinicalNotes'],
      attachments: List<String>.from(json['attachments'] ?? []),
      gestationalAge: json['gestationalAge'],
      expectedDeliveryDate: json['expectedDeliveryDate'] != null
          ? DateTime.tryParse(json['expectedDeliveryDate'].toString())
          : null,
      gravida: json['gravida'],
      para: json['para'],
      clinicalCondition: json['clinicalCondition'],
      riskLevel: json['riskLevel'] ?? 'LOW',
      motherSnapshot: json['motherSnapshot'] != null
          ? MotherSnapshot.fromJson(json['motherSnapshot'])
          : null,
      liaisonNote: json['liaisonNote'],
      isUnlocked: json['isUnlocked'] ?? false,
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'].toString())
          : null,
      expiredAt: json['expiredAt'] != null
          ? DateTime.tryParse(json['expiredAt'].toString())
          : null,
      gateCheckedInAt: json['gateCheckedInAt'] != null
          ? DateTime.tryParse(json['gateCheckedInAt'].toString())
          : null,
      status: json['status'] ?? 'DRAFT',
      acceptedAt: json['acceptedAt'] != null
          ? DateTime.tryParse(json['acceptedAt'].toString())
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'].toString())
          : null,
      targetDepartment: json['targetDepartment'],
      decisionMeta: json['decisionMeta'] != null
          ? DecisionMeta.fromJson(json['decisionMeta'])
          : null,
      activityLog: (json['activityLog'] as List<dynamic>?)
              ?.map((x) => ActivityLogItem.fromJson(x))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt'].toString()),
      updatedAt: DateTime.parse(json['updatedAt'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'referralCode': referralCode,
      'motherId': motherId,
      'fromHospital': fromHospital,
      'fromFacilityType': fromFacilityType,
      'toHospital': toHospital,
      'toFacilityType': toFacilityType,
      'createdBy': createdBy,
      'patientName': patientName,
      'patientPhone': patientPhone,
      'urgency': urgency,
      'reasonForReferral': reasonForReferral,
      'clinicalNotes': clinicalNotes,
      'attachments': attachments,
      'gestationalAge': gestationalAge,
      'expectedDeliveryDate': expectedDeliveryDate?.toIso8601String(),
      'gravida': gravida,
      'para': para,
      'clinicalCondition': clinicalCondition,
      'riskLevel': riskLevel,
      'motherSnapshot': motherSnapshot?.toJson(),
      'liaisonNote': liaisonNote,
      'isUnlocked': isUnlocked,
      'expiresAt': expiresAt?.toIso8601String(),
      'expiredAt': expiredAt?.toIso8601String(),
      'gateCheckedInAt': gateCheckedInAt?.toIso8601String(),
      'status': status,
      'acceptedAt': acceptedAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'targetDepartment': targetDepartment,
      'decisionMeta': decisionMeta?.toJson(),
      'activityLog': activityLog.map((x) => x.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class MotherSnapshot {
  final String? name;
  final String? phone;
  final int? age;
  final String? address;
  final String? emergencyContact;
  final String? medicalHistory;
  final DateTime? expectedDeliveryDate;
  final bool? highRisk;
  final int? gravida;
  final int? para;
  final DateTime? lmp;
  final String? bloodType;
  final String? rhFactor;
  final String? hivStatus;
  final String? hepatitisB;
  final bool? hypertension;
  final bool? diabetes;
  final bool? anemia;
  final bool? previousCSection;

  MotherSnapshot({
    this.name,
    this.phone,
    this.age,
    this.address,
    this.emergencyContact,
    this.medicalHistory,
    this.expectedDeliveryDate,
    this.highRisk,
    this.gravida,
    this.para,
    this.lmp,
    this.bloodType,
    this.rhFactor,
    this.hivStatus,
    this.hepatitisB,
    this.hypertension,
    this.diabetes,
    this.anemia,
    this.previousCSection,
  });

  factory MotherSnapshot.fromJson(Map<String, dynamic> json) {
    return MotherSnapshot(
      name: json['name'],
      phone: json['phone'],
      age: json['age'],
      address: json['address'],
      emergencyContact: json['emergencyContact'],
      medicalHistory: json['medicalHistory'],
      expectedDeliveryDate: json['expectedDeliveryDate'] != null
          ? DateTime.tryParse(json['expectedDeliveryDate'])
          : null,
      highRisk: json['highRisk'],
      gravida: json['gravida'],
      para: json['para'],
      lmp: json['lmp'] != null ? DateTime.tryParse(json['lmp']) : null,
      bloodType: json['bloodType'],
      rhFactor: json['rhFactor'],
      hivStatus: json['hivStatus'],
      hepatitisB: json['hepatitisB'],
      hypertension: json['hypertension'],
      diabetes: json['diabetes'],
      anemia: json['anemia'],
      previousCSection: json['previousCSection'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'age': age,
      'address': address,
      'emergencyContact': emergencyContact,
      'medicalHistory': medicalHistory,
      'expectedDeliveryDate': expectedDeliveryDate?.toIso8601String(),
      'highRisk': highRisk,
      'gravida': gravida,
      'para': para,
      'lmp': lmp?.toIso8601String(),
      'bloodType': bloodType,
      'rhFactor': rhFactor,
      'hivStatus': hivStatus,
      'hepatitisB': hepatitisB,
      'hypertension': hypertension,
      'diabetes': diabetes,
      'anemia': anemia,
      'previousCSection': previousCSection,
    };
  }
}

class DecisionMeta {
  final dynamic responderId;
  final String? justification;
  final DateTime? appointmentDate;

  DecisionMeta({
    this.responderId,
    this.justification,
    this.appointmentDate,
  });

  factory DecisionMeta.fromJson(Map<String, dynamic> json) {
    return DecisionMeta(
      responderId: json['responderId'],
      justification: json['justification'],
      appointmentDate: json['appointmentDate'] != null
          ? DateTime.tryParse(json['appointmentDate'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'responderId': responderId,
      'justification': justification,
      'appointmentDate': appointmentDate?.toIso8601String(),
    };
  }
}

class ActivityLogItem {
  final String status;
  final dynamic actor;
  final DateTime timestamp;
  final String? note;

  ActivityLogItem({
    required this.status,
    this.actor,
    required this.timestamp,
    this.note,
  });

  factory ActivityLogItem.fromJson(Map<String, dynamic> json) {
    return ActivityLogItem(
      status: json['status'] ?? '',
      actor: json['actor'],
      timestamp: DateTime.parse(json['timestamp'].toString()),
      note: json['note'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status': status,
      'actor': actor,
      'timestamp': timestamp.toIso8601String(),
      'note': note,
    };
  }
}
