import { useState } from "react";
import { Button } from "@/components/ui/button"; // Use your button component

type AgreementModalProps = {
    onAgree: () => void;
};

export function AgreementModal({ onAgree }: AgreementModalProps) {
    const [visible] = useState(true);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-full m-4 h-[90%] flex flex-col">
                <h2 className="text-xl font-semibold mb-4">Terms of Service</h2>

                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600">
                        <p>
                            End User License Agreement (EULA) for Jams Player
                            (also referred to as “JAMS”)
                        </p>
                        <p>Last Updated: [11-08-2024]</p>
                        <br />
                        <p>
                            This End User License Agreement (“Agreement”) is a
                            legal contract between you (“User”) and the
                            developers, contributors, or owners of Jams Player
                            (also referred to as “JAMS”) (“we,” “our,” or “us”)
                            governing your use of the Jams Player application
                            (“Application” or “JAMS”) and associated services.
                        </p>
                        <br />
                        <p>
                            By installing, accessing, or using JAMS, you agree
                            to comply with the terms of this Agreement. If you
                            do not agree with these terms, do not install,
                            access, or use JAMS.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>Purpose and Scope</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            JAMS is a decentralized music storage and playback
                            application that interfaces with the Autonomi
                            network (“Network”), a distributed, peer-to-peer
                            storage infrastructure. JAMS allows Users to upload,
                            store, and access audio content, but it does not
                            directly store data on the User’s behalf or exercise
                            control over any content stored within the Network.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>User Responsibilities</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            a. <em>Data Ownership and Control</em>
                        </p>
                        <br />
                        <p>
                            Users retain full ownership and responsibility for
                            any content uploaded to or stored within the Network
                            through JAMS. This includes but is not limited to
                            obtaining appropriate permissions, adhering to
                            copyright laws, and ensuring that content complies
                            with all applicable legal standards.
                        </p>
                        <br />
                        <p>
                            b. <em>Compliance with Laws</em>
                        </p>
                        <br />
                        <p>
                            Users are solely responsible for ensuring that their
                            activities through JAMS comply with all applicable
                            laws, regulations, and third-party rights. The
                            developers, contributors, and owners of JAMS shall
                            not be held responsible for any violations of law or
                            misuse of the Application by Users.
                        </p>
                        <br />
                        <p>
                            c. <em>Authentication and Data Security</em>
                        </p>
                        <br />
                        <p>
                            Autonomi network’s self-authentication system
                            requires Users to manage their unique credentials,
                            such as seed phrases or passwords, to access and
                            retrieve their encrypted data. JAMS does not manage,
                            store, or have access to these credentials. Users
                            are solely responsible for safeguarding their
                            credentials, as the loss of these may result in the
                            inability to access stored data.
                        </p>
                        <br />
                        <p>
                            d.{" "}
                            <em>
                                Responsibility for Network Fees and Transactions
                            </em>
                        </p>
                        <br />
                        <p>
                            Users are responsible for any fees associated with
                            storing or modifying data on the Autonomi network.
                            Retrieval of stored data is free on the Network.
                            JAMS may facilitate transactions through the
                            Autonomi wallet API, such as purchases or donations
                            to artists, but it does not directly manage or
                            process payments related to data storage or
                            modification fees within the Network.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>License Grant</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            The developers, contributors, and owners grant the
                            User a limited, non-exclusive, non-transferable,
                            revocable license to use JAMS solely for personal,
                            non-commercial purposes, in accordance with this
                            Agreement.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>Limitations and Restrictions</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            a. <em>Prohibited Uses</em>
                        </p>
                        <br />
                        <p>
                            Users are prohibited from using JAMS to upload or
                            store content that infringes upon third-party
                            intellectual property rights, violates copyright, or
                            breaches any local, state, national, or
                            international laws.
                        </p>
                        <br />
                        <p>
                            b. <em>Limitation on Liability</em>
                        </p>
                        <br />
                        <p>
                            The developers, contributors, owners, and affiliated
                            entities of JAMS shall not be held responsible for
                            any misuse or unlawful use of the Application by the
                            User. Any liability resulting from misuse or
                            violation of this Agreement rests solely with the
                            User.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>Data Encryption and Privacy</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            a. <em>Encryption via Autonomi API</em>
                        </p>
                        <br />
                        <p>
                            Data is encrypted and split into chunks by the
                            Autonomi API before distribution across the Network.
                            The JAMS Application does not handle or manage
                            encryption directly, nor does it store or access
                            User data or encryption keys. All encryption and
                            decryption are managed by Autonomi’s self-encrypting
                            protocol.
                        </p>
                        <br />
                        <p>
                            b. <em>Credential Management</em>
                        </p>
                        <br />
                        <p>
                            Users authenticate to the Network using their unique
                            credentials (such as seed phrases or passwords),
                            which are necessary to access and retrieve their
                            data. JAMS does not store, retrieve, or otherwise
                            manage these credentials.
                        </p>
                        <br />
                        <p>
                            c. <em>Privacy Disclaimer</em>
                        </p>
                        <br />
                        <p>
                            While the Autonomi network is designed to protect
                            User privacy and data security, the developers,
                            contributors, and owners of JAMS do not guarantee
                            the privacy, security, or retention of data stored
                            on the Network. Users should take all necessary
                            steps to secure and back up sensitive data, as JAMS
                            assumes no responsibility for data loss,
                            unauthorized access, or credential mismanagement.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>Disclaimer of Warranties</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            JAMS is provided “as is,” without warranties of any
                            kind, whether express or implied. The developers,
                            contributors, and owners do not warrant that JAMS
                            will operate without interruption, that defects will
                            be corrected, or that the Network will be accessible
                            at all times. Users assume full responsibility for
                            using JAMS and acknowledge that the Application is
                            subject to the limitations and constraints of the
                            Autonomi network.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>Limitation of Liability</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            To the maximum extent permitted by law, the
                            developers, contributors, owners, and affiliated
                            entities of JAMS shall not be liable for any damages
                            arising from the use or inability to use JAMS,
                            including but not limited to data loss, unauthorized
                            access, or third-party claims. This limitation of
                            liability applies regardless of the basis for the
                            claim.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>
                                    Disclaimers Regarding Access and Use
                                </strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            JAMS is a decentralized application built on the
                            Autonomi network, where data storage and access are
                            outside the direct control of the developers,
                            contributors, or owners. As such, we cannot
                            terminate or suspend user access to content stored
                            within the Network.
                        </p>
                        <br />
                        <p>
                            However, we reserve the right to discontinue support
                            for JAMS, modify the Application, or release updates
                            that may impact functionality, at any time.
                            Additionally, we disclaim any responsibility for
                            misuse or unlawful activity performed by users.
                            Users are solely responsible for ensuring compliance
                            with all applicable laws and regulations and assume
                            all risks associated with the use of JAMS.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>Governing Law</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            This Agreement shall be governed by and construed in
                            accordance with the laws of the State of Wyoming,
                            United States, without regard to its conflict of law
                            principles.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>Modifications to Agreement</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            The developers, contributors, and owners of JAMS
                            reserve the right to update or modify this Agreement
                            at any time. Users will be notified of significant
                            changes, and continued use of JAMS after
                            modifications constitutes acceptance of the updated
                            terms.
                        </p>
                        <br />
                        <ol>
                            <li>
                                <strong>Contact Information</strong>
                            </li>
                        </ol>
                        <br />
                        <p>
                            For questions regarding this Agreement, please
                            contact <strong>contact@jams.community</strong>.
                        </p>
                        <p>
                            By using JAMS, you acknowledge that you have read,
                            understood, and agree to be bound by this Agreement.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button onClick={onAgree}>Agree</Button>
                </div>
            </div>
        </div>
    );
}
