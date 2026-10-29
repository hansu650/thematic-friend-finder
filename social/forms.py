from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from .models import Interest, Profile, Report

class LoginForm(AuthenticationForm):
    username = forms.CharField(label="用户名", widget=forms.TextInput(attrs={"autocomplete": "username", "placeholder": "输入你的用户名"}))
    password = forms.CharField(label="密码", widget=forms.PasswordInput(attrs={"autocomplete": "current-password", "placeholder": "输入你的密码"}))

class SignupForm(UserCreationForm):
    display_name = forms.CharField(label="昵称", max_length=24)
    adult_confirmed = forms.BooleanField(label="我已年满 18 岁")
    class Meta:
        model = User
        fields = ["username", "display_name", "password1", "password2", "adult_confirmed"]
    def save(self, commit=True):
        user = super().save(commit=commit)
        if commit:
            Profile.objects.create(user=user, display_name=self.cleaned_data["display_name"], adult_confirmed=True)
        return user

class ProfileForm(forms.ModelForm):
    interests = forms.ModelMultipleChoiceField(
        label="你的兴趣", queryset=Interest.objects.all(), required=True,
        widget=forms.CheckboxSelectMultiple, help_text="选 1–6 项，让推荐更贴近你。"
    )
    class Meta:
        model = Profile
        fields = ["display_name", "headline", "bio", "campus", "goal", "interests", "discoverable"]
        labels = {
            "display_name": "昵称", "headline": "一句话介绍", "bio": "关于我",
            "campus": "校园或城市", "goal": "我想找人一起", "discoverable": "允许新朋友在发现页看到我",
        }
        widgets = {
            "bio": forms.Textarea(attrs={"rows": 4, "placeholder": "聊聊你的兴趣，以及最近想一起做的事。"}),
            "headline": forms.TextInput(attrs={"placeholder": "例如：想找个周末一起逛展的人"}),
        }
    def clean_interests(self):
        values = self.cleaned_data["interests"]
        if len(values) > 6:
            raise forms.ValidationError("最多选择 6 项兴趣。")
        return values
    def clean_bio(self):
        value = self.cleaned_data["bio"].strip()
        if not value:
            raise forms.ValidationError("写一点关于你的介绍，再开始认识新朋友吧。")
        return value

class ReportForm(forms.ModelForm):
    class Meta:
        model = Report
        fields = ["reason", "details"]
        labels = {"reason": "举报原因", "details": "补充说明（选填）"}
        widgets = {"details": forms.Textarea(attrs={"rows": 3, "maxlength": 500})}

class MessageForm(forms.Form):
    body = forms.CharField(max_length=1000, strip=True)
