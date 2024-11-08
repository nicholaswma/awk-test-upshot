import { BoltMessageSDK } from '../utils/BoltMessageSDK';
import { Button } from './Button';
const owner_beta =
    'p_yLxkyD46ZqC1l5sx3gagNgByIh2vSaudBhAQVodYy3p54Ry4hc-LhA1Be4JZ_dmI4oY7l4LZBJ1fKmguJp5lh7-mG_5T93Bk1li5vB1vcO-B3Ii9WzAqQONUwnfI3etzUSX4qA3eW61rkq5W_6a2hjYsXhqUB-CStq9H1NNgA94pZM4hqjSEnDaWURtl2pFX2T6oNcsAT5WSCXVpRxiCLHca8T4lfKTjh-njrrWdHDMymFUHGTjHWXs2VphS0CHdwSs4LepkQakUKvavv5zCOUxHHrdf2LAijfZ_4t-DnyONFuhebsU2oHk0_14qcJn0o0m32jtpD2G2gQvRMDUG-sbYP21Fduy_T1Ex6HQuWTi01lV1O2k11NnsU0lWFGA1ODKrASOslh6manHh2WBUQuNvOBm7e4Mh_xdRfpregJzOZ5aUkQN3jF3uiA_dv3UQB8WYlZC_YvRd4eCpD3u5taC9dzEpWhITZ_R-biQaO-hd41uCc_UjI_PF0g-mOT6_896YU8QotyV_5ORZr2FTtH1gWHdI2bAaCUckkG4gJc16CnHCXiJXg8SQR5rRQvqbeqKnSH2lvqo71N6tSf8uHMXre6VS14CmMT3UwQ9i5Bg2qiOS7yA_VIPjICEaFOQmXF7ptNTIUQQqRXs-jTldE08Su_NI1xlbfUC1fLBhU';
const owner_funded =
    'k5VvEcCjhWgy6YXI7PtaKEPmZZhcR8iZl6IQ8mr2CmHOgGNxcCkjGsUP5F98a_h6rSRX-ECilNyhmoYztWhKJWsL0HnHp0GohweGTntAsFsP3-bAKKaSoDNhYUCriGtncCCMJupl__LrtPf4gRPzubrlpNJySaRjk1fCebqFi6LdOvPYdRSKvGkiz9SE0AyFDY16wUqrVVRPhOpCWlKeyaK9vxKikaq99KlfkR9CgTw61pua4TZQX_5ceBMeNZCyCYyKH0Zi7XNv-IbXhp5XR4I1DAGmukmPxeHYKF-3lSxpuneAq4sd9XiV4tAgozQ1tkJFxxBoJORbkxu3D0qGio82mKeAnqh77X41mVeJXe6t82XMMR7xcZmlk5AeMOAXlXhJ3-rXgpsnVLcd8EJojNEIy4opKCqsG1V0eYP2ZHQIqLqYodyV0Osn4JeEvXvxx-j7B22dg_qT7eii3IG1xTuMuPaXeqdd4fFHhs30fBlMJrF5Nrhn3M23k-Q6w2r9Ibnx6STw-qHwwgHD0NQT_WSQbxvnegOvfgVrB5j3JuvN5TZhNuJ9KLq_8SIjRqeeFKGgnUcK_NXEcEgkl7bi4QMpvGd29ZypMOgEXa0Uwl892suuOExqpvSmslyUHBz7gbRVQ9RvorFFxcVCguKcO4vw9eB9batA3xKMxZHjPLs';
const owner_lorimer =
    '3D92Fr9f9SBZ0-WfmunpbSokzZpCaXOy09Ob3VVuqc8r6CJGWJ-czLhkdiZp_oVyOS7Ui03IiYhlUxK10pzPM7ExXNUwqYTV4t41FOsRzQ58E0I4IcHX_PEeS2_PGvBh5LkrN6eHLs62HXuaboQLOJJEvtYATeD_jjJTEvIY79qTk-SohQLCAIcmdZhulrx2SO4ChkhGD-Vv_NwUjiMw9jb4T4dRvzCNg0sH7ICLsb_1jILJSjNtwzZPZuf34L7grvNhB1iTg_TWD0w6i-IbSN9UXJqra-z7rS5AcUbZIAbhvc-r1rja4AHmQR5ogbIrwzSBS5WN0c92pSGy0nfxi9Npp6xTa84zkRts0etFkMjiIy3JnBIg8fJoSYaSLn4-7G-Ek0JWWYl-QVBTlQ61HgcSCseXgt5LpvXDWGWIPQTCm6eiud6x0K-XR7wd1FCJoD5CobwCpGIY_ciJf4nZ1vZs65_iCcwhYamfjZTsnY_VWtepOEXenpSnrAudcGbzotqJNZQgZTpfVqrdW1rzJ92nX3_JDDeW0bBUTNSIHXO-gJC9aBfB3H6TcNbMVxWjol2jF-Cp--eISa-cw35bWute5GqIrOop3JlTNll9zqdQwqCbTmNUtHj4LOcAYogH-k5s5Qa-TvHPE2M4c1CJwTg1dIe-GjjKFt9xb8gtYT8';
// const owner_other =
//     'iJBqmPbIrIBXAZHEifW4NgwYyekKMnq8tuzFuZjRkP82VbSIA4iuVTqtnhmfTl72x7KgDitH0ZVPxL1pGWcl9eAx6gXH8fhayB0IoCrWZd2ZHEaR7P7NFXR_mebHKpPMCwQ6zcxmjFk5Qp-wTwuWcihFlnx3Rb85XvtYIBtmFE2irWE1_gvTFqSr_stucjQyGZ-e6G9DMuq4U1vzCG8dJLzUHuag3I-eWaDwQYpaQNW2DveNSClhSECHTluGruxwEz3fvPIRP3ViPoyAGpR77gXNBTfURRGn4BdGcGU6soXTXUkn4t0cgDKcEqyvTAhdgc_IweiYFjHQrMV8etjRe9AjyfiqjNBaMeyEcPpFgavXYdowYErk0UMAU7Aa4ZQgRrvjx_1AYRc_6ZGURlWvY133SRkt42LySbHt85O2k0UZ5UDkCBQyOF-zkNPl9Nu-HpzMvLFHnSiTDYFmFMMJbwGOdtHQH2SkIZvRAKpFcqU3SrG2iAInQsc4wX-SZec7lDl1qqb-1iCHx4hEe-M0LPc38q57L3YZC85N-0WXwL8739E1ct9z5Grf-fWTqnz5Q5PKVGMuWV_3dzwsB9mXf8umouTWr2l7aoaSuNKwbcq7RDTRU5-4OoaHUY2DUlnQa0ooke3c5g8Sv8ilazz2eXyzxWLg4avcf7rwl0IqIkc';
const owners = [owner_funded, owner_beta, owner_lorimer]; //, owner_other];

const message =
    'This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - This is an encrypted message - ';

export function BoltTest() {
    const test = async () => {
        const Bolt = new BoltMessageSDK(owners);
        const start = new Date().getTime();

        const times = 1;
        for (let i = 0; i < times; i++) {
            const encrypted = await Bolt.encryptMessage(message);
            const decryptedKey = await Bolt.decryptAESKey(encrypted, '');
            const decryptedMsg = await Bolt.decryptMessageWithKey(
                encrypted,
                decryptedKey
            );
            if (i === 0) {
                console.log(encrypted);
                console.log(decryptedKey);
                console.log(decryptedMsg.length);
                console.log(decryptedMsg);
            } else {
                if (!(i % 100)) console.log(i);
            }
        }
        console.log((new Date().getTime() - start) / times);
    };

    return (
        <div className="justify-betweengap-2 flex w-full flex-col items-start">
            <div className="-mt-2 flex w-full items-center justify-between space-y-2">
                <Button onClick={test}>Test Bolt Encryption</Button>
            </div>
        </div>
    );
}
