import React from "react";
import type { FormProps } from "antd";
import { App, Button, Divider, Form, Input } from "antd";
import { useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI, loginWithGoogleAPI } from "@/services/api";
import { useCurrentApp } from "@/components/context/app.context";
import { GooglePlusOutlined } from "@ant-design/icons";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
type FieldType = {
    username: string;
    password: string;
};

const LoginPage = () => {
    const [isSubmit, setIsSubmit] = useState(false);
    const { message, notification } = App.useApp();
    const { setIsAuthenticated, setUser } = useCurrentApp();
    const navigate = useNavigate();
    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        setIsSubmit(true);
        const { username, password } = values;

        const res = await loginAPI(username, password);
        setIsSubmit(false);
        if (res?.data) {
            setIsAuthenticated(true);
            setUser(res.data.user);
            localStorage.setItem("access_token", res.data.access_token);
            message.success("Đăng nhập tài khoản thành công!");

            navigate("/");
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description:
                    res.message && Array.isArray(res.message)
                        ? res.message[0]
                        : res.message,
                duration: 5,
            });
        }
    };

    const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
        errorInfo
    ) => {
        console.log("Failed:", errorInfo);
    };
    const loginGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log(tokenResponse);

            const { data } = await axios(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${tokenResponse?.access_token}`,
                    },
                }
            );
            if (data && data.email) {
                const res = await loginWithGoogleAPI("GOOGLE", data.email);
                if (res?.data) {
                    setIsAuthenticated(true);
                    setUser(res.data.user);
                    localStorage.setItem("access_token", res.data.access_token);
                    message.success("Đăng nhập tài khoản thành công!");
                    navigate("/");
                } else {
                    notification.error({
                        message: "Có lỗi xảy ra",
                        description:
                            res.message && Array.isArray(res.message)
                                ? res.message[0]
                                : res.message,
                        duration: 5,
                    });
                }
            }
        },
    });
    return (
        <div className="login-page">
            <main className="main">
                <div className="container">
                    <section className="wrapper">
                        <div className="heading">
                            <h2 className="text text-large">Đăng Nhập</h2>
                            <Divider />
                        </div>
                        <Form
                            name="form-register"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Email"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: "Email không được để trống!",
                                    },
                                    {
                                        type: "email",
                                        message: "Email không đúng định dạng!",
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Mật khẩu không được để trống!",
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item label={null}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmit}
                                >
                                    Đăng nhập
                                </Button>
                            </Form.Item>
                            <Divider>Or</Divider>
                            <div
                                onClick={() => loginGoogle()}
                                title="Đăng nhập với tài khoản Google"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 10,
                                    textAlign: "center",
                                    marginBottom: 25,
                                    cursor: "pointer",
                                }}
                            >
                                Đăng nhập với{" "}
                                <GooglePlusOutlined
                                    style={{ fontSize: 30, color: "green" }}
                                />
                            </div>
                            <p
                                className="text text-normal"
                                style={{ textAlign: "center" }}
                            >
                                Chưa có tài khoản ?
                                <span>
                                    <Link to="/register"> Đăng ký </Link>
                                </span>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};
export default LoginPage;
