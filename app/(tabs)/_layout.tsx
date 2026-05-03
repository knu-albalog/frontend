import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type TabItemProps = {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function TabBarItem({ focused, icon, activeIcon, label }: TabItemProps) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
        <Ionicons
          name={focused ? activeIcon : icon}
          size={22}
          color={focused ? '#2140DC' : '#A0A0A0'}
        />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 82 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 18 : 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => (
            <TabBarItem
              focused={focused}
              icon="home-outline"
              activeIcon="home"
              label="홈"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) => (
            <TabBarItem
              focused={focused}
              icon="calendar-outline"
              activeIcon="calendar"
              label="캘린더"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="request"
        options={{
          title: '요구사항',
          tabBarIcon: ({ focused }) => (
            <TabBarItem
              focused={focused}
              icon="chatbubbles-outline"
              activeIcon="chatbubbles"
              label="요구사항"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused }) => (
            <TabBarItem
              focused={focused}
              icon="person-outline"
              activeIcon="person"
              label="마이"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapFocused: {
    backgroundColor: '#F0F4FF',
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#A0A0A0',
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: '#2140DC',
    fontWeight: '700',
  },
});