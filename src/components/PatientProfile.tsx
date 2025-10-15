import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PatientInfo } from '@/lib/openai';

interface PatientProfileProps {
  patientInfo?: PatientInfo;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patientInfo }) => {
  if (!patientInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-xl">
                PT
              </div>
            </Avatar>
            <div>
              <p className="text-muted-foreground">
                Start a conversation to generate a patient profile
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get initials for avatar
  const getInitials = () => {
    if (patientInfo.name) {
      return patientInfo.name.charAt(0).toUpperCase();
    }
    return patientInfo.gender?.charAt(0)?.toUpperCase() || 'PT';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Patient Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-16 w-16">
            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-xl">
              {getInitials()}
            </div>
          </Avatar>
          <div>
            <p className="text-lg font-medium">
              {patientInfo.name ? `${patientInfo.name}, ` : ''}
              {patientInfo.age ? `${patientInfo.age} years old` : 'Unknown age'}{' '}
              {patientInfo.gender || 'patient'}
            </p>
            {patientInfo.occupation && (
              <p className="text-sm text-muted-foreground">{patientInfo.occupation}</p>
            )}
            {patientInfo.maritalStatus && (
              <p className="text-sm text-muted-foreground">{patientInfo.maritalStatus}</p>
            )}
            {patientInfo.chiefComplaint && (
              <Badge variant="outline" className="mt-1">
                {patientInfo.chiefComplaint}
              </Badge>
            )}
          </div>
        </div>

        {patientInfo.condition && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Psychological Condition</h4>
            <p className="text-sm text-muted-foreground">{patientInfo.condition}</p>
          </div>
        )}

        {patientInfo.symptoms && patientInfo.symptoms.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Reported Symptoms</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5">
              {patientInfo.symptoms.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {patientInfo.duration && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Duration</h4>
            <p className="text-sm text-muted-foreground">Experiencing symptoms for {patientInfo.duration}</p>
          </div>
        )}

        {patientInfo.lifeStressors && patientInfo.lifeStressors.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Life Stressors</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5">
              {patientInfo.lifeStressors.map((stressor, index) => (
                <li key={index}>{stressor}</li>
              ))}
            </ul>
          </div>
        )}

        {patientInfo.previousTreatment && patientInfo.previousTreatment.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Previous Treatment</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5">
              {patientInfo.previousTreatment.map((treatment, index) => (
                <li key={index}>{treatment}</li>
              ))}
            </ul>
          </div>
        )}

        {patientInfo.familyHistory && patientInfo.familyHistory.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Family History</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5">
              {patientInfo.familyHistory.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {patientInfo.personalityTraits && patientInfo.personalityTraits.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Personality Traits</h4>
            <div className="flex flex-wrap gap-1">
              {patientInfo.personalityTraits.map((trait, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {patientInfo.copingMechanisms && patientInfo.copingMechanisms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Coping Mechanisms</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5">
              {patientInfo.copingMechanisms.map((mechanism, index) => (
                <li key={index}>{mechanism}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientProfile;