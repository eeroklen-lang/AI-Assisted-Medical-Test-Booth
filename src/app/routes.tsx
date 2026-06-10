import { createHashRouter } from 'react-router';
import { IDScan } from './pages/IDScan';
import { Welcome } from './pages/Welcome';
import { ConfirmDetails } from './pages/ConfirmDetails';
import { LandingPage } from './pages/LandingPage';
import { OnboardingVideo } from './pages/OnboardingVideo';
import { Questionnaire } from './pages/Questionnaire';
import { ContactStaff } from './pages/ContactStaff';
import { Step1 } from './pages/Step1';
import { Step2 } from './pages/Step2';
import { Step3 } from './pages/Step3';
import { Step4 } from './pages/Step4';
import { TutorialVideo } from './pages/TutorialVideo';
import { SpirometryTest } from './pages/SpirometryTest';
import { Processing } from './pages/Processing';
import { MouthpieceDisposal } from './pages/MouthpieceDisposal';
import { ScheduleAppointment } from './pages/ScheduleAppointment';
import { COPDEducation } from './pages/COPDEducation';
import { ClinicianDashboard } from './pages/ClinicianDashboard';
import { Results } from './pages/Results';
import { Logout } from './pages/Logout';
import bgImage from 'figma:asset/12b2a4a1b62665d755b99759e34812000a50a650.png';

export const router = createHashRouter([
  {
    path: '/',
    Component: IDScan,
  },
  {
    path: '/id-scan',
    Component: IDScan,
  },
  {
    path: '/welcome',
    Component: Welcome,
  },
  {
    path: '/confirm-details',
    Component: ConfirmDetails,
  },
  {
    path: '/home',
    Component: LandingPage,
  },
  {
    path: '/spirometer/onboarding',
    Component: OnboardingVideo,
  },
  {
    path: '/spirometer/questionnaire',
    Component: Questionnaire,
  },
  {
    path: '/spirometer/contact-staff',
    Component: ContactStaff,
  },
  {
    path: '/spirometer/step1',
    Component: Step1,
  },
  {
    path: '/spirometer/step2',
    Component: Step2,
  },
  {
    path: '/spirometer/step3',
    Component: Step3,
  },
  {
    path: '/spirometer/step4',
    Component: Step4,
  },
  {
    path: '/spirometer/tutorial',
    Component: TutorialVideo,
  },
  {
    path: '/spirometer/test',
    Component: SpirometryTest,
  },
  {
    path: '/spirometer/processing',
    Component: Processing,
  },
  {
    path: '/spirometer/disposal',
    Component: MouthpieceDisposal,
  },
  {
    path: '/spirometer/schedule',
    Component: ScheduleAppointment,
  },
  {
    path: '/spirometer/education',
    Component: COPDEducation,
  },
  {
    path: '/spirometer/results',
    Component: Results,
  },
  {
    path: '/spirometer/logout',
    Component: Logout,
  },
  {
    path: '/clinician',
    Component: ClinicianDashboard,
  },
  // Placeholder routes for other tests
  {
    path: '/blood-pressure',
    Component: () => (
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <p className="relative text-5xl text-white">Blood Pressure Test - Coming Soon</p>
      </div>
    ),
  },
  {
    path: '/oximeter',
    Component: () => (
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <p className="relative text-5xl text-white">Oximeter Test - Coming Soon</p>
      </div>
    ),
  },
  {
    path: '/hba1c',
    Component: () => (
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <p className="relative text-5xl text-white">HBA1C Test - Coming Soon</p>
      </div>
    ),
  },
  {
    path: '/haemoglobin',
    Component: () => (
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <p className="relative text-5xl text-white">Haemoglobin Test - Coming Soon</p>
      </div>
    ),
  },
  {
    path: '/cholesterol',
    Component: () => (
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <p className="relative text-5xl text-white">Cholesterol Test - Coming Soon</p>
      </div>
    ),
  },
]);
